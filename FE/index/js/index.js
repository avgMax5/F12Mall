document.addEventListener('DOMContentLoaded', () => {
  let fPressCount = 0;
  
  const f12Btn = document.getElementById('f12-btn');
  if (f12Btn) {
    f12Btn.addEventListener('click', () => {
      fPressCount++;
      console.log(`f12 button clicked. Count: ${fPressCount}`);
      
      if (fPressCount === 12) {
        document.cookie = "secretToken=my-secret";
        window.location.href = '/login';
        fPressCount = 0;
      }
    });
  }
  
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-btn');
  
  const handleSearch = () => {
    const searchValue = searchInput.value.trim().toLowerCase();
    if (searchValue === 'f12_all') {
      document.cookie = "secretToken=my-secret";
      window.location.href = '/login';
    }
  };
  
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    });
  }
  
  // 'f' 키 눌렀을 경우 카운트
  document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'f' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      fPressCount++;
      console.log(`f key pressed. Count: ${fPressCount}`);

    } else if (event.key.toLowerCase() !== 'f') {
      fPressCount = 0;
    }
    
    if (fPressCount === 12) {
      document.cookie = "secretToken=my-secret";
      window.location.href = '/login';
      fPressCount = 0;
    }
  });
}); 

