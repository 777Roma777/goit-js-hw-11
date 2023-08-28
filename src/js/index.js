import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import { fetchImages } from './api';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const endMessageContainer = document.querySelector('.end-message');
let page = 1;
let currentQuery = '';

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionsPosition: 'bottom',
  captionDelay: 250,
});

lightbox.on('show.simplelightbox', showImage);
lightbox.on('close.simplelightbox', closeImage);

form.addEventListener('submit', async e => {
  e.preventDefault();
  const searchQuery = e.target.elements.searchQuery.value.trim();

  if (searchQuery === '') return;

  currentQuery = searchQuery;
  page = 1;
  gallery.innerHTML = '';
  endMessageContainer.innerHTML = '';
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

    const totalPages = Math.ceil(data.totalHits / perPage);

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

    if (page < totalPages) {
      loadMoreBtn.style.display = 'block';
    } else {
      loadMoreBtn.style.display = 'none';
      if (data.totalHits > 0) {
        endMessageContainer.innerHTML = `<p class="end-message">We're sorry, but you've reached the end of search results.</p>`;
      }
    }

    return data;
  } catch (error) {
    throw new Error(error.message);
  }
}

function showImage(event) {
  const imageContainer = event.image;
  const imageAlt = imageContainer.querySelector('img').getAttribute('alt');
  const description = document.createElement('div');
  description.classList.add('image-description');
  description.textContent = imageAlt;
  imageContainer.appendChild(description);
}

function closeImage(event) {
  const imageContainer = event.image;
  const description = imageContainer.querySelector('.image-description');
  if (description) {
    imageContainer.removeChild(description);
  }
}
