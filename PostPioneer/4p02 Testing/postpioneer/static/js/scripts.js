document.addEventListener('DOMContentLoaded', function() {
    // Function to handle tab switching
    function openTab(evt, tabName) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";  
        }
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(tabName).style.display = "block";  
        evt.currentTarget.className += " active";
    }

    // Set up event listeners for tab buttons
    var tabButtons = document.getElementsByClassName("tablinks");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].addEventListener('click', function(event) {
            openTab(event, this.getAttribute('data-tab'));
        });
    }

    // Automatically open the first tab
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }
});