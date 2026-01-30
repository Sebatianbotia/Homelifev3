
async function loadComponents() {
            try {   
                const headerResponse = await fetch('assets/includes/header.html');
                const headerHtml = await headerResponse.text();
                document.getElementById('header-container').innerHTML = headerHtml;
                const navbarResponse = await fetch('assets/includes/navbar.html');
                const navbarHtml = await navbarResponse.text();
                document.getElementById('navbar-container').innerHTML = navbarHtml;

                if (window.initNavbar) window.initNavbar();
                
                const footerResponse = await fetch('assets/includes/footer.html');
                const footerHtml = await footerResponse.text();
                document.getElementById('footer-container').innerHTML = footerHtml;
                
               
                const chatbotResponse = await fetch('assets/includes/chatbot.html');
                const chatbotHtml = await chatbotResponse.text();
                document.getElementById('chatbotContainer').innerHTML = chatbotHtml; 

            } catch (error) {
                console.error('errpr cargando componentes:', error);
            }
        }
document.addEventListener('DOMContentLoaded', loadComponents);
