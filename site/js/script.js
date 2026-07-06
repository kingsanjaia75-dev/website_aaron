// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Sticky header shadow
const header = document.getElementById('siteHeader');
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 20;
  header.classList.toggle('scrolled', scrolled);
  backToTop.classList.toggle('show', window.scrollY > 500);
});
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('mainNav');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mainNav.classList.toggle('open');
});
mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mainNav.classList.remove('open');
  });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.main-nav a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) current = section.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
});

// Reveal on scroll
const revealItems = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealItems.forEach(item => io.observe(item));

// What is BMI toggle
const whatIsBmi = document.getElementById('whatIsBmi');
const bmiInfo = document.getElementById('bmiInfo');
whatIsBmi.addEventListener('click', () => {
  bmiInfo.hidden = !bmiInfo.hidden;
});

// BMI calculator
const bmiForm = document.getElementById('bmiForm');
const bmiResult = document.getElementById('bmiResult');
const bmiValue = document.getElementById('bmiValue');
const bmiCategory = document.getElementById('bmiCategory');

bmiForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const heightCm = parseFloat(document.getElementById('bmiHeight').value);
  const weightKg = parseFloat(document.getElementById('bmiWeight').value);
  if (!heightCm || !weightKg) return;

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const rounded = bmi.toFixed(1);

  let category;
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Healthy Weight';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';

  bmiValue.textContent = rounded;
  bmiCategory.textContent = category;
  bmiResult.hidden = false;
  bmiResult.classList.add('show');
});

// Newsletter form (no backend — just confirms)
const newsletterForm = document.getElementById('newsletterForm');
const newsletterNote = document.getElementById('newsletterNote');
newsletterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  newsletterNote.hidden = false;
  newsletterForm.reset();
});

// Contact form (no backend — just confirms)
const contactForm = document.getElementById('contactForm');
const contactNote = document.getElementById('contactNote');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  contactNote.hidden = false;
  contactForm.reset();
});
