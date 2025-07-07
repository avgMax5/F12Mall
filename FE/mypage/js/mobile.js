document.addEventListener('DOMContentLoaded', () => {
  let headerOriginalParent = null;
  let headerOriginalNextSibling = null;

  let bioOriginalParent = null;
  let bioOriginalNextSibling = null;

  function moveHeaderIfMobile() {
    const header = document.querySelector('#include-header');
    const sectionLeft = document.querySelector('.section-left');

    if (headerOriginalParent == null) {
      headerOriginalParent = header.parentElement;
      headerOriginalNextSibling = header.nextElementSibling;
      console.log('headerOriginalNextSibling:', headerOriginalNextSibling);
    }

    if (window.innerWidth <= 767) {
      if (!sectionLeft.contains(header)) {
        sectionLeft.prepend(header);
        console.log('headerOriginalNextSibling:', headerOriginalNextSibling);
      }
    } else {
      if (headerOriginalNextSibling != header.headerOriginalNextSibling) {
        headerOriginalParent.insertBefore(header, headerOriginalNextSibling);
      }
    }
  }

  function moveBioIfMobile() {
    const mainLeft = document.querySelector('.main-left');
    const mediaContainer = document.querySelector('.media-profile-right-row');

    if (bioOriginalParent == null) {
      bioOriginalParent = mainLeft.parentElement;
      bioOriginalNextSibling = mainLeft.nextElementSibling;
      console.log('bioOriginalNextSibling:', bioOriginalNextSibling);
    }

    if (window.innerWidth <= 767) {
      if (!mediaContainer.contains(mainLeft)) {
        mediaContainer.prepend(mainLeft);
      }
    } else {
      if (bioOriginalNextSibling != mainLeft.bioOriginalNextSibling) {
        bioOriginalParent.insertBefore(mainLeft, bioOriginalNextSibling);
      }
    }
  }

  window.addEventListener('load', () => {
    moveHeaderIfMobile();
    moveBioIfMobile();
  });
  window.addEventListener('resize', () => {
    moveHeaderIfMobile();
    moveBioIfMobile();
  });
});
