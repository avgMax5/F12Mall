document.addEventListener('DOMContentLoaded', function() {
    // 컨트롤러 버튼 요소
    const orderbookBtn = document.querySelector('.orderbook-btn');
    const myorderlistBtn = document.querySelector('.myorderlist-btn');
    const containerOrderbook = document.querySelector('.container-orderbook');
    const orderbookContent = document.querySelector('.orderbook-content');
    const myorderlistContent = document.querySelector('.myorderlist-content');
    
    // 초기 상태 설정 (orderbook 모드)
    containerOrderbook.classList.add('orderbook-mode');
    orderbookBtn.classList.add('active');
    myorderlistBtn.classList.add('deactive');
    orderbookContent.classList.add('active');
    myorderlistContent.classList.add('deactive');
    
    // OrderBook 버튼 클릭 이벤트
    orderbookBtn.addEventListener('click', function() {
        if (!this.classList.contains('active')) {
            // 버튼 상태 변경
            this.classList.add('active');
            this.classList.remove('deactive');
            myorderlistBtn.classList.remove('active');
            myorderlistBtn.classList.add('deactive');
            
            // content 상태 변경
            orderbookContent.classList.add('active');
            orderbookContent.classList.remove('deactive');
            myorderlistContent.classList.remove('active');
            myorderlistContent.classList.add('deactive');
            
            // 컨테이너 모드 변경
            containerOrderbook.classList.remove('myorderlist-mode');
            containerOrderbook.classList.add('orderbook-mode');
        }
    });
    
    // MyOrderList 버튼 클릭 이벤트
    myorderlistBtn.addEventListener('click', function() {
        if (!this.classList.contains('active')) {
            // 버튼 상태 변경
            this.classList.add('active');
            this.classList.remove('deactive');
            orderbookBtn.classList.remove('active');
            orderbookBtn.classList.add('deactive');
            
            // content 상태 변경
            myorderlistContent.classList.add('active');
            myorderlistContent.classList.remove('deactive');
            orderbookContent.classList.remove('active');
            orderbookContent.classList.add('deactive');
            
            // 컨테이너 모드 변경
            containerOrderbook.classList.remove('orderbook-mode');
            containerOrderbook.classList.add('myorderlist-mode');
        }
    });
});
