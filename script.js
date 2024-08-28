document.addEventListener("DOMContentLoaded", function () {
    const configUrl = "config.json";
    const itemsPerPage = 6;
    let currentCategoryIndex = 0;
    let currentPage = 1;

    fetch(configUrl)
        .then(response => response.json())
        .then(config => {
            // 设置广告图片
            document.getElementById("top-ad").innerHTML = `<img src="${config.ads.top}" alt="Top Ad">`;
            document.getElementById("bottom-ad").innerHTML = `<img src="${config.ads.bottom}" alt="Bottom Ad">`;

            // 生成分类菜单
            const categoryMenu = document.getElementById("category-menu");
            config.categories.forEach((category, index) => {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = "#";
                a.textContent = category.name;
                a.addEventListener("click", () => {
                    currentCategoryIndex = index;
                    currentPage = 1;
                    displayImages(config.categories[currentCategoryIndex].images);
                });
                li.appendChild(a);
                categoryMenu.appendChild(li);
            });

            // 显示默认分类的图片
            displayImages(config.categories[currentCategoryIndex].images);
        });

    function displayImages(images) {
        const imageGrid = document.getElementById("image-grid");
        imageGrid.innerHTML = "";

        const start = (currentPage - 1) * itemsPerPage;
        const paginatedImages = images.slice(start, start + itemsPerPage);

        paginatedImages.forEach(imageUrl => {
            const img = document.createElement("img");
            img.setAttribute("data-src", imageUrl);
            img.alt = "图片";
            img.classList.add("lazy");
            imageGrid.appendChild(img);
        });

        // 懒加载
        lazyLoadImages();

        // 更新分页按钮
        updatePagination(images.length);
    }

    function updatePagination(totalItems) {
        const pagination = document.getElementById("pagination");
        pagination.innerHTML = "";

        const totalPages = Math.ceil(totalItems / itemsPerPage);

        const prevButton = document.createElement("button");
        prevButton.textContent = "上一页";
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener("click", () => {
            currentPage--;
            displayImages(config.categories[currentCategoryIndex].images);
        });
        pagination.appendChild(prevButton);

        const nextButton = document.createElement("button");
        nextButton.textContent = "下一页";
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener("click", () => {
            currentPage++;
            displayImages(config.categories[currentCategoryIndex].images);
        });
        pagination.appendChild(nextButton);
    }

    function lazyLoadImages() {
        const lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

        if ("IntersectionObserver" in window) {
            const lazyImageObserver = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        const lazyImage = entry.target;
                        lazyImage.src = lazyImage.dataset.src;
                        lazyImage.classList.remove("lazy");
                        lazyImage.classList.add("lazyloaded");
                        lazyImageObserver.unobserve(lazyImage);
                    }
                });
            });

            lazyImages.forEach(function (lazyImage) {
                lazyImageObserver.observe(lazyImage);
            });
        } else {
            // 如果浏览器不支持 IntersectionObserver，则使用退化的懒加载
            let lazyLoadThrottleTimeout;
            function lazyload() {
                if (lazyLoadThrottleTimeout) {
                    clearTimeout(lazyLoadThrottleTimeout);
                }

                lazyLoadThrottleTimeout = setTimeout(function () {
                    const scrollTop = window.pageYOffset;
                    lazyImages.forEach(function (img) {
                        if (img.offsetTop < (window.innerHeight + scrollTop)) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            img.classList.add("lazyloaded");
                        }
                    });
                    if (lazyImages.length === 0) {
                        document.removeEventListener("scroll", lazyload);
                        window.removeEventListener("resize", lazyload);
                        window.removeEventListener("orientationChange", lazyload);
                    }
                }, 20);
            }

            document.addEventListener("scroll", lazyload);
            window.addEventListener("resize", lazyload);
            window.addEventListener("orientationChange", lazyload);
        }
    }
});
