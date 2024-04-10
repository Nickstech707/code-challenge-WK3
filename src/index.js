
document.addEventListener('DOMContentLoaded', function() {
  // Remove placeholder li element
  const placeholderLi = document.querySelector('#films .film.item');
  if (placeholderLi) {
    placeholderLi.remove();
  }

  const filmsList = document.getElementById('films');

  // Fetch the details of the first movie
  fetchMovieDetails(1);

  // Fetch the list of movies
  fetchMovieList();

  
  // Function to fetch movie details
  function fetchMovieDetails(movieId) {
    fetch(`/films/${movieId}`)
        .then(response => response.json())
        .then(movie => {
            const posterImg = document.getElementById('poster');
            posterImg.src = movie.poster;
            posterImg.alt = movie.title;

            const titleDiv = document.getElementById('title');
            titleDiv.textContent = movie.title;

            const runtimeDiv = document.getElementById('runtime');
            runtimeDiv.textContent = `${movie.runtime} minutes`;

            const filmInfoDiv = document.getElementById('film-info');
            filmInfoDiv.textContent = movie.description;

            const showtimeSpan = document.getElementById('showtime');
            showtimeSpan.textContent = movie.showtime;

            const availableTickets = movie.capacity - movie.tickets_sold;
            const ticketNumSpan = document.getElementById('ticket-num');
            ticketNumSpan.textContent = `${availableTickets} remaining tickets`;

            if (availableTickets === 0) {
                buyTicketBtn.textContent = 'Sold Out';
                buyTicketBtn.disabled = true;
            } else {
                buyTicketBtn.textContent = 'Buy Ticket';
                buyTicketBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error fetching movie details:', error);
        });
}
    })

 
  // An event listener for buying tickets
  const buyTicketBtn = document.getElementById('buy-ticket');

  buyTicketBtn.addEventListener('click', async function() {
    try {
      const filmResponse = await fetch('/films/1'); // Change the URL to your server endpoint
      const filmData = await filmResponse.json();

      if (filmData.tickets_sold < filmData.capacity) {
        const updatedTicketsSold = filmData.tickets_sold + 1;

        // Update tickets_sold on the server
        await fetch('/films/1', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ tickets_sold: updatedTicketsSold })
        });

        // Create a new ticket in the database
        await fetch('/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ film_id: 1, number_of_tickets: 1 })
        });

        // Fetch updated movie details
        fetchMovieDetails(1);
      }
    }
    catch (error) {
      console.error('Error purchasing ticket:', error);
    }
  });

  // Event listener for deleting a movie
  const deleteFilmBtn = document.getElementById('delete-film');
  deleteFilmBtn.addEventListener('click', async function() {
    try {
      await fetch('/films/1', {
        method: 'DELETE'
      });

      // Remove the film from the list
      fetchMovieList();
      fetchMovieDetails(1);
    } catch (error) {
      console.error('Error deleting film:', error);
    }
  });

  // Function to fetch movie list
  function fetchMovieList() {
    fetch('http://localhost:3000/films') // Change the URL to your server endpoint
      .then(response => response.json())
      .then(movies => {
        filmsList.innerHTML = ''; // Clear existing list

        movies.forEach(movie => {
          const li = document.createElement('li');
          li.classList.add('film', 'item');
          li.textContent = movie.title;

          if (movie.tickets_sold === movie.capacity) {
            li.classList.add('sold-out');
          }

          filmsList.appendChild(li);
        });
      })
      .catch(error => {
        console.error('Error fetching movie list:', error);
      });
  }
