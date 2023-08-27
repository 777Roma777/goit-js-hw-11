import axios from 'axios';

const apiKey = '39085998-de98ea17e1a185b93e997485c';

export async function fetchImages(query, page, perPage) {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw new Error('An error occurred while fetching images.');
  }
}
