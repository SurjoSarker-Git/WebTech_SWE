let header =document.querySelector('header');
let navLinks =document.querySelectorAll('nav a');
let sections =document.querySelectorAll('section');

window.onscroll = () =>{

    if(window.scrollY > 50){
        header.style.background ="#111";
        header.style.boxShadow ="0 0 20px rgba(0,0,0,0.6)";
    } 
    else {
        header.style.background ="transparent";
        header.style.boxShadow ="none";
    }

    let scrollY =window.pageYOffset;

    sections.forEach(sec=>{
        let top=sec.offsetTop-150;
        let height=sec.offsetHeight;
        let id=sec.getAttribute('id');

        if(scrollY>=top&&scrollY<top+height){
            navLinks.forEach(link => {
                link.classList.remove('active');
                document.querySelector('nav a[href*='+id+']')?.classList.add('active');
            });
        }
    });
};