document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('back-btn');
    const stars = document.querySelectorAll('.star-input span');
    const ratingValue = document.getElementById('star-rating-value');
    const reviewForm = document.getElementById('review-form');
    const reviewsContainer = document.getElementById('reviews-container');
    const authorNameInput = document.getElementById('author-name');
    const reviewCommentInput = document.getElementById('review-comment');
    const submitButton = reviewForm.querySelector('button[type="submit"]');
    let reviews = [];
    let editingReviewId = null;

    const defaultReviews = [
        { id: 1, author: 'Anonim', comment: 'Harika bir uçuştu! Personel çok ilgili ve yardımseverdi. Kesinlikle tekrar tercih edeceğim.', rating: 5 },
        { id: 2, author: 'Anonim', comment: 'Uçak temiz ve konforluydu. Sadece rötardan dolayı bir yıldız kırdım. Genel olarak memnun kaldım.', rating: 4 },
        { id: 3, author: 'Anonim', comment: 'Yemekler çok lezzetliydi. Uçuşum boyunca hiç sıkılmadım. Teşekkürler!', rating: 5 },
        { id: 4, author: 'Anonim', comment: 'İkramlar daha iyi olabilirdi. Koltuk araları biraz dar geldi.', rating: 3 },
        { id: 5, author: 'Anonim', comment: 'Tam zamanında kalkış ve varış. Pilotun anonsları çok hoştu.', rating: 5 },
        { id: 6, author: 'Anonim', comment: 'Kabin ekibi çok güler yüzlüydü. Tek sorun, online check-in yaparken zorlanmamdı.', rating: 4 },
    ];

    const initializeReviews = () => {
        const storedReviews = localStorage.getItem('reviews');
        if (!storedReviews) {
            reviews = [...defaultReviews];
            saveReviews();
        } else {
            reviews = JSON.parse(storedReviews);
        }
    };

    backBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    const saveReviews = () => {
        localStorage.setItem('reviews', JSON.stringify(reviews));
    };

    const renderReviews = () => {
        reviewsContainer.innerHTML = '';
        reviews.forEach(review => {
            const reviewEl = document.createElement('div');
            reviewEl.classList.add('review');
            reviewEl.setAttribute('data-id', review.id);

            reviewEl.innerHTML = `
                <div class="review-header">
                    <span class="review-author">${review.author}</span>
                    <div class="star-rating">
                        <span>${'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}</span>
                    </div>
                </div>
                <p class="review-text">${review.comment}</p>
                <div class="review-actions">
                    <button class="edit-btn" data-translate="edit_button">Düzenle</button>
                    <button class="delete-btn" data-translate="delete_button">Sil</button>
                </div>
            `;
            reviewsContainer.appendChild(reviewEl);
        });
        translatePage();
    };

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const value = star.getAttribute('data-value');
            ratingValue.value = value;
            stars.forEach(s => s.classList.remove('selected'));
            let current = star;
            while(current) {
                current.classList.add('selected');
                current = current.previousElementSibling;
            }
        });
    });

    reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const authorName = authorNameInput.value;
        const reviewComment = reviewCommentInput.value;
        const rating = ratingValue.value;

        if (rating === '0') {
            alert('Lütfen bir puan seçin.');
            return;
        }

        if (editingReviewId) {
            // Update existing review
            const review = reviews.find(r => r.id === editingReviewId);
            review.author = authorName;
            review.comment = reviewComment;
            review.rating = rating;
            editingReviewId = null;
            submitButton.textContent = 'Yorumu Gönder';
            submitButton.removeAttribute('data-translate');
            submitButton.setAttribute('data-translate', 'submit_review_button');

        } else {
            // Add new review
            const newReview = {
                id: Date.now(),
                author: authorName,
                comment: reviewComment,
                rating: rating
            };
            reviews.unshift(newReview);
        }

        saveReviews();
        renderReviews();
        reviewForm.reset();
        ratingValue.value = '0';
        stars.forEach(s => s.classList.remove('selected'));
    });

    reviewsContainer.addEventListener('click', (e) => {
        const id = e.target.closest('.review').dataset.id;
        if (e.target.classList.contains('delete-btn')) {
            reviews = reviews.filter(review => review.id != id);
            saveReviews();
            renderReviews();
        }

        if (e.target.classList.contains('edit-btn')) {
            const review = reviews.find(r => r.id == id);
            authorNameInput.value = review.author;
            reviewCommentInput.value = review.comment;
            ratingValue.value = review.rating;
            
            stars.forEach(s => s.classList.remove('selected'));
            const starToSelect = document.querySelector(`.star-input span[data-value="${review.rating}"]`);
            if(starToSelect) {
                let current = starToSelect;
                while(current) {
                    current.classList.add('selected');
                    current = current.previousElementSibling;
                }
            }
            
            editingReviewId = review.id;
            submitButton.textContent = 'Yorumu Güncelle';
            submitButton.removeAttribute('data-translate');
            submitButton.setAttribute('data-translate', 'update_review_button');
            authorNameInput.focus();
        }
    });

    initializeReviews();
    renderReviews();
});