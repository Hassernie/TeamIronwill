document.addEventListener('DOMContentLoaded', () => {

  // --- Smooth Scrolling (Optional - CSS handles basic smooth scroll) ---
  // You can keep this if you need more control or target specific elements outside anchors
  // const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
  // smoothScrollLinks.forEach(link => {
  //   link.addEventListener('click', function(e) {
  //     e.preventDefault();
  //     const targetId = this.getAttribute('href');
  //     const targetElement = document.querySelector(targetId);
  //     if (targetElement) {
  //       targetElement.scrollIntoView({
  //         behavior: 'smooth',
  //         block: 'start'
  //       });
  //     }
  //   });
  // });

  // --- Active Navigation Link Highlighting ---
  const navLinks = document.querySelectorAll('.nav-links a');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html'; // Default to index.html if path is '/'

  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href').split('/').pop();
    if (linkPath === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });


  // --- Lightbox Functionality ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');
  const galleryItems = document.querySelectorAll('.gallery-item'); // Select all gallery links

  let currentIndex = 0;
  let items = []; // Array to store gallery item data {src, caption, element}

  // Populate items array from gallery links
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img'); // Find the image within the link
    if (img && item.href) { // Ensure item has an image and href
      items.push({
        src: item.href, // High-res image source from link's href
        caption: item.dataset.caption || img.alt || 'Gallery Image', // Use data-caption, fallback to alt, then generic
        element: item // Store the original link element
      });
    } else {
      console.warn(`Gallery item at index ${index} is missing image or href.`);
    }
  });

  // Function to open the lightbox
  function openLightbox(index) {
    if (!lightbox || !lightboxImg || index < 0 || index >= items.length) {
      console.error("Lightbox elements not found or index out of bounds.");
      return;
    }
    currentIndex = index;
    updateLightboxContent();
    lightbox.classList.add('active'); // Make lightbox visible
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    closeBtn?.focus(); // Focus the close button when opened
  }

  // Function to close the lightbox
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active'); // Hide lightbox
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore background scrolling
    // Focus back on the gallery item that opened the lightbox
    if(items[currentIndex] && items[currentIndex].element) {
        items[currentIndex].element.focus();
    }
  }

  // Function to update the lightbox image and caption
  function updateLightboxContent() {
    if (!lightboxImg || !lightboxCaption || currentIndex < 0 || currentIndex >= items.length) return;
    lightboxImg.src = items[currentIndex].src;
    lightboxImg.alt = items[currentIndex].caption || 'Enlarged gallery image'; // Ensure alt text is set
    lightboxCaption.textContent = items[currentIndex].caption;
  }

  // Function to show the previous image
  function showPrev() {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1; // Loop back
    updateLightboxContent();
  }

  // Function to show the next image
  function showNext() {
    currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0; // Loop forward
    updateLightboxContent();
  }

  // Add click event listeners to gallery items
   items.forEach((itemData, itemIndex) => {
      if (itemData.element) {
          itemData.element.addEventListener('click', (e) => {
              e.preventDefault(); // Prevent default link behavior
              openLightbox(itemIndex);
          });
      }
  });


  // Add event listeners for lightbox controls
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from closing via background click listener
        closeLightbox();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrev();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
    });
  }

  // Close lightbox if clicking on the background overlay
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      // Close only if the click is directly on the lightbox background itself
       // Check if the click target is the lightbox itself or the content wrapper
       if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
          closeLightbox();
      }
    });
  }

  // Keyboard navigation for lightbox
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return; // Only if lightbox is active

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault(); // Prevent window scroll
        showPrev();
    } else if (e.key === 'ArrowRight') {
        e.preventDefault(); // Prevent window scroll
        showNext();
    }
  });

   // --- Add data-label attribute to table cells for responsive view ---
   const table = document.querySelector('.event-table');
   if (table) {
        // Use more specific selector if there are multiple tables
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
        table.querySelectorAll('tbody tr').forEach(row => {
            row.querySelectorAll('td').forEach((cell, index) => {
                if(headers[index]) { // Check if header exists for the index
                   cell.setAttribute('data-label', headers[index]);
                }
            });
        });
   }

  // --- Intersection Observer for Scroll Animations ---
  const animatedElements = document.querySelectorAll('.card, .history-content, .team-section, .gallery-item'); // Select elements to animate

  if ('IntersectionObserver' in window) { // Check if browser supports it
    const observerOptions = {
      root: null, // relative to the viewport
      rootMargin: '0px',
      threshold: 0.1 // Trigger when 10% of the element is visible (adjust as needed)
    };

    const observerCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Stop observing once visible to prevent re-animation
        }
        // Optional: Add 'else' block to remove 'visible' class if element scrolls out of view
        // else { entry.target.classList.remove('visible'); }
      });
    };

    const intersectionObserver = new IntersectionObserver(observerCallback, observerOptions);

    animatedElements.forEach(el => {
      intersectionObserver.observe(el);
    });
  } else {
      // Fallback for older browsers: make all elements visible immediately
      console.log("IntersectionObserver not supported, showing all animated elements.");
      animatedElements.forEach(el => el.classList.add('visible'));
  }


  console.log("Enhanced scripts initialized.");

}); // End DOMContentLoaded