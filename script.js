/* =============================================================================
   SARAH WHITFIELD COUNSELING — SCRIPT
   =============================================================================
   No frameworks, no build step — just vanilla JS split into small, commented
   sections. Each section is independent, so you can delete any one of them
   without breaking the others.

   Sections:
     1. Mobile nav toggle
     2. Sticky header shadow on scroll
     3. Scroll-reveal animations (IntersectionObserver)
     4. Testimonial marquee — duplicate the track for a seamless loop
     5. Contact form — fake "submitted" state (READ THIS ONE — has the
        on/off switch for the animation, and notes on wiring up Formspree)
     6. Footer year
============================================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ===========================================================================
     1. MOBILE NAV TOGGLE
     Hamburger button shows/hides the nav panel on small screens (see the
     `.main-nav.is-open` rule in the 640px media query in styles.css).
  =========================================================================== */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Tapping a nav link closes the mobile menu automatically, so people
    // don't land on the section and still see the menu covering it.
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }


  /* ===========================================================================
     2. STICKY HEADER SHADOW ON SCROLL
     Adds `.is-scrolled` to the header once the page has scrolled past a small
     threshold, which is what triggers the box-shadow in styles.css. Uses
     requestAnimationFrame to throttle — scroll fires A LOT, and we don't need
     to check on every single one of those events.
  =========================================================================== */
  var siteHeader = document.getElementById('siteHeader');
  var scrollTicking = false;

  function updateHeaderShadow() {
    if (siteHeader) {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 12);
    }
    scrollTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(updateHeaderShadow);
      scrollTicking = true;
    }
  });
  updateHeaderShadow(); // run once on load in case the page opens mid-scroll (e.g. anchor link)


  /* ===========================================================================
     3. SCROLL-REVEAL ANIMATIONS
     Every element with class="reveal" starts invisible + shifted down (see
     .reveal in styles.css). As soon as ~15% of it scrolls into view, we add
     `.is-visible`, which triggers the CSS transition back to normal. Each
     element is only revealed ONCE — `observer.unobserve(el)` right after,
     so scrolling back up and down doesn't re-trigger it.

     If the person has "reduce motion" turned on at the OS level, skip the
     whole animation and just show everything immediately — respecting that
     setting matters more than the effect.
  =========================================================================== */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    // No animation support (or user opted out) — just show everything.
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }


  /* ===========================================================================
     4. TESTIMONIAL MARQUEE — DUPLICATE THE TRACK
     The CSS animation (.marquee-track, in styles.css) scrolls the track
     exactly -50% and loops. That only looks seamless if the track's total
     width is genuinely double the visible content — so here we clone every
     card in the track once and append the clones right after the originals.

     Want to add/remove testimonials? Just edit the ORIGINAL <blockquote>
     cards in index.html — this script re-clones whatever is there on page
     load, you don't need to touch this file.
  =========================================================================== */
  var marqueeTrack = document.getElementById('marqueeTrack');

  if (marqueeTrack) {
    var originalCards = Array.prototype.slice.call(marqueeTrack.children);
    originalCards.forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true'); // screen readers only need to hear the quotes once
      marqueeTrack.appendChild(clone);
    });
  }


  /* ===========================================================================
     5. CONTACT FORM — FAKE "SUBMITTED" STATE
     ---------------------------------------------------------------------------
     HOW THIS WORKS RIGHT NOW (demo mode):
       The <form> still has a real `action` pointing at Formspree in
       index.html, but we intercept `submit`, call preventDefault(), and swap
       in the `.form-success` panel instead of letting the browser navigate
       away. This is ONLY so you can show a client "here's what happens when
       someone submits" without actually sending anything anywhere yet.

     TWO SEPARATE ON/OFF SWITCHES BELOW — read the comment on each:

       DEMO_MODE       — controls whether submitting fakes success (true) or
                         actually lets the form POST to Formspree normally
                         (false). Flip this to `false` once you've swapped
                         in a real Formspree endpoint in index.html and you
                         want the form to go live.

       DEMO_ANIMATION  — controls ONLY the animated checkmark / fade-in.
                         Set to `false` and the exact same success panel
                         still appears, it just pops in instantly with no
                         drawing animation. This is the switch the client
                         asked for: "make sure the animation can be disabled
                         easily in code."
     ---------------------------------------------------------------------------
     GOING LIVE WITH FORMSPREE LATER:
       1. Replace `YOUR_FORM_ID` in index.html's <form action="..."> with
          the real Formspree endpoint.
       2. Set DEMO_MODE to false below.
       That's it — with DEMO_MODE false, this script does nothing on submit
       and the browser handles the POST + Formspree's own redirect/thank-you
       behavior normally. (If you'd rather stay on this page and show the
       SAME success panel after a real submission, see the commented-out
       fetch() example at the bottom of this section instead of flipping
       DEMO_MODE off.)
  =========================================================================== */
  var DEMO_MODE = true;         // <-- set to false when the real Formspree endpoint is wired up
  var DEMO_ANIMATION = true;    // <-- set to false to disable the checkmark/fade-in animation only

  var contactForm = document.getElementById('contactForm');
  var formSuccess = document.getElementById('formSuccess');
  var resetFormBtn = document.getElementById('resetFormBtn');

  if (contactForm && formSuccess) {

    contactForm.addEventListener('submit', function (event) {
      if (!DEMO_MODE) return; // let the browser submit to Formspree normally

      event.preventDefault();

      // Very light validation using the browser's built-in constraints
      // (the `required` attributes already on the inputs in index.html).
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      showSuccessPanel();
    });

    function showSuccessPanel() {
      contactForm.hidden = true;
      formSuccess.hidden = false;

      if (DEMO_ANIMATION) {
        // Adding `.is-visible` triggers the CSS transitions/keyframes: the
        // panel fades + slides up, then the checkmark circle and check
        // "draw" themselves in with a short delay between the two.
        requestAnimationFrame(function () {
          formSuccess.classList.add('is-visible');
        });
      } else {
        // Animation OFF: add `.static-success` instead of `.is-visible`.
        // In styles.css, `.static-success` jumps straight to the finished
        // look with `transition: none` and `animation: none` — the panel
        // and checkmark just appear, already complete. Because this never
        // adds `.is-visible`, none of the animated CSS rules can fire.
        formSuccess.classList.add('static-success');
      }
    }

    if (resetFormBtn) {
      resetFormBtn.addEventListener('click', function () {
        formSuccess.hidden = true;
        formSuccess.classList.remove('is-visible', 'static-success');
        contactForm.hidden = false;
        contactForm.reset();
      });
    }
  }

  /* ---------------------------------------------------------------------
     OPTIONAL: real AJAX submission to Formspree while KEEPING this same
     success panel (instead of a full page redirect). Uncomment and delete
     the DEMO_MODE block above if you want this instead:

     contactForm.addEventListener('submit', function (event) {
       event.preventDefault();
       if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }

       fetch(contactForm.action, {
         method: 'POST',
         body: new FormData(contactForm),
         headers: { 'Accept': 'application/json' }
       }).then(function (response) {
         if (response.ok) {
           showSuccessPanel();
         } else {
           alert('Something went wrong — please try again or call/email directly.');
         }
       }).catch(function () {
         alert('Something went wrong — please try again or call/email directly.');
       });
     });
  --------------------------------------------------------------------- */


  /* ===========================================================================
     6. FOOTER YEAR
     Keeps the copyright year correct without ever having to remember to
     update it by hand.
  =========================================================================== */
  var yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

});
