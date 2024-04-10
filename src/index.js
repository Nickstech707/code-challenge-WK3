// Event listener for when the DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Selecting various elements from the DOM
  const movieTitles = document.querySelector(".film.item");
  const movieDescription = document.querySelector(".description");
  const buyTicket = document.querySelector("#buy-ticket");
  const deleteMovieButton = document.querySelector("#delete-film");
  const filmsList = document.querySelector("#films");
  let currentMovie = null;

  // Function to display detailed information about a movie
  function displayMovieDetails(movie) {
    const posters = document.getElementById("poster");
    posters.src = movie.poster;
    movieDescription.innerHTML = `
      <div class="card">
        <div id="title" class="title">${movie.title}</div>
        <div id="runtime" class="meta">Runtime: ${movie.runtime} minutes</div>
        <div class="content">
          <div class="description">
            <div id="film-info">${movie.description}</div>
            <span id="showtime" class="ui label">${movie.showtime}</span>
            <span id="ticket-num">Tickets remaining: ${
              movie.capacity - movie.tickets_sold
            }</span>
          </div>
        </div>
      </div>`;

    // Update buy ticket button based on ticket availability
    if (movie.tickets_sold >= movie.capacity) {
      buyTicket.textContent = "Sold Out";
      buyTicket.setAttribute("disabled", "true");
    } else {
      buyTicket.textContent = "Buy Ticket";
      buyTicket.removeAttribute("disabled");
    }
  }

  // Function to display the movie menu
  function displayMovieMenu(movies) {
    filmsList.innerHTML = "";
    movies.forEach((movie) => {
      const li = document.createElement("li");
      li.className = "film item";
      li.textContent = movie.title;
      li.style.cursor = "pointer";

      // Add 'sold-out' class if tickets are sold out for a movie
      if (movie.tickets_sold >= movie.capacity) {
        li.classList.add("sold-out");
      }

      // Event listener for when a movie is clicked
      li.addEventListener("click", () => {
        const selectedMovie = movies.find((m) => m.title === movie.title);
        currentMovie = selectedMovie;
        displayMovieDetails(selectedMovie);

        // Remove 'selected' class from any previously selected movie
        const previousSelected = document.querySelector(".film.selected");
        if (previousSelected) {
          previousSelected.classList.remove("selected");
        }

        // Add 'selected' class to the clicked movie
        li.classList.add("selected");
      });

      filmsList.appendChild(li);
    });
  }

  // Function to handle deletion of a movie by sending a DELETE request to the server
  function deleteMovieHandler(movieId, listItem) {
    fetch(`http://localhost:3000/films/${movieId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(() => {
        filmsList.removeChild(listItem);
      })
      .catch((error) => {
        console.error("Delete error:", error);
      });
  }

  // Event listener for the delete movie button, confirms the deletion and triggers deleteMovieHandler
  deleteMovieButton.addEventListener("click", (event) => {
    event.preventDefault();
    const confirmDelete = confirm(
      "Are you sure you want to delete this movie?"
    );
    if (confirmDelete) {
      deleteMovieHandler(currentMovie.id);
    }
  });

  // Function to fetch movie data from the server
  function fetchMovieData() {
    fetch("http://localhost:3000/films")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          displayMovieMenu(data);
          const firstMovie = data[0];
          currentMovie = firstMovie;
          displayMovieDetails(firstMovie);
        } else {
          movieTitles.innerHTML = "No movies found";
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      });
  }

  // Function to handle updating ticket status by sending a PATCH request to the server
  function updateTicketHandler(ticketId) {
    fetch(`http://localhost:3000/tickets/${ticketId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "used",
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Ticket updated successfully:", data);
      })
      .catch((error) => {
        console.error("Ticket update error:", error);
      });
  }

  // Function to handle buying a ticket for the current movie
  function buyTicketHandler() {
    if (currentMovie.tickets_sold < currentMovie.capacity) {
      currentMovie.tickets_sold++;
      displayMovieDetails(currentMovie);

      fetch("http://localhost:3000/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          film_id: currentMovie.id,
          tickets_sold: currentMovie.tickets_sold,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Ticket purchased successfully:", data);
        })
        .catch((error) => {
          console.error("Ticket purchase error:", error);
        });
    }
  }

  // Event listener for buying a ticket
  buyTicket.addEventListener("click", buyTicketHandler);

  // Event listener for deleting a movie
  deleteMovieButton.addEventListener("click", () => {
    const selectedMovieItem = document.querySelector(".selected");
    deleteMovieHandler(selectedMovieItem.dataset.movieId, selectedMovieItem);
  });

  // Initial fetch of movie data when the script is loaded
  fetchMovieData();
});
