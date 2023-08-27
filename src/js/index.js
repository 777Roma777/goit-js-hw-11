import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import { fetchImages } from './api';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
let page = 1;
let currentQuery = '';

const lightbox = new SimpleLightbox('.gallery a');

form.addEventListener('submit', async e => {
  e.preventDefault();
  const searchQuery = e.target.elements.searchQuery.value.trim();

  if (searchQuery === '') return;

  currentQuery = searchQuery;
  page = 1;
  gallery.innerHTML = '';
  loadMoreBtn.style.display = 'none';

  await performSearch(currentQuery);
  lightbox.refresh();
});

loadMoreBtn.addEventListener('click', async () => {
  page += 1;
  await fetchAndRenderImages(currentQuery);
  lightbox.refresh();
});

async function performSearch(query) {
  try {
    const data = await fetchAndRenderImages(query);
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
}

async function fetchAndRenderImages(query) {
  const perPage = 40;

  try {
    const data = await fetchImages(query, page, perPage);

    if (data.hits.length === 0) {
      gallery.innerHTML = '';
      throw new Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    gallery.innerHTML += data.hits
  .map(
    image => `
    <div class="photo-card">
      <a href="${image.largeImageURL}" data-lightbox="image-${page}">
        <div class="image-container">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        </div>
      </a>
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
        <p class="info-item"><b>Views:</b> ${image.views}</p>
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    </div>
  `
  )
  .join('');


    if (data.totalHits > page * perPage) {
      loadMoreBtn.style.display = 'block';
    } else {
      loadMoreBtn.style.display = 'none';
      if (data.totalHits > 0) {
        gallery.innerHTML += `<p class="end-message">We're sorry, but you've reached the end of search results.</p>`;
      }
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

window.addEventListener('scroll', () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const bodyHeight = document.body.offsetHeight;

  if (
    scrollPosition >= bodyHeight - 100 &&
    currentQuery &&
    loadMoreBtn.style.display === 'block'
  ) {
    loadMoreBtn.click();
  }
});
