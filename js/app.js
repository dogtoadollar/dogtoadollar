console.log("APP JS LOADED");

document.addEventListener("DOMContentLoaded", () => {

    let currentPhaseId = null;
    let hasInitialPriceLoaded = false;
    let mobileViewedPhase = null;

    function waitForImage(src){
        return new Promise(resolve => {
            const image = new Image();
            image.onload = resolve;
            image.onerror = resolve;
            image.src = src;
        });
    }

    const criticalAssetsReady = Promise.race([
        Promise.all([
            document.fonts ? document.fonts.ready : Promise.resolve(),
            waitForImage("images/full-moon.png"),
            waitForImage("images/dog-rocket.png"),
            waitForImage("images/dog-bottom.png")
        ]),
        new Promise(resolve => setTimeout(resolve, 2500))
    ]);

    function hideSiteLoader(){
        criticalAssetsReady.then(() => {
            document.body.classList.add("site-loaded");

            setTimeout(() => {
                const loader = document.getElementById("siteLoader");

                if(loader){
                    loader.remove();
                }
            }, 600);
        });
    }

    const phaseOrder = [
        "bottom",
        "beginning",
        "momentum",
        "skybound",
        "moonbound"
    ];

    const phaseText = {
        bottom: { title:"THE BOTTOM", price:"$0.0001 - $0.00099" },
        beginning: { title:"THE BEGINNING", price:"$0.001 - $0.0099" },
        momentum: { title:"BUILDING MOMENTUM", price:"$0.01 - $0.099" },
        skybound: { title:"SKYBOUND", price:"$0.10 - $0.99" },
        moonbound: { title:"MOONBOUND", price:"$1.00+" }
    };

    const mobileScenes = {
        bottom: `
            <div class="dog-scene-bottom">
                <img src="images/dog-bottom.png" class="phase-bottom-dog" alt="">
                <img src="images/bottle.png" class="bottle" alt="">
                <img src="images/bowl.png" class="bowl" alt="">
                <img src="images/newspaper.png" class="newspaper" alt="">
            </div>
        `,
        beginning: `
            <div class="dog-scene-beginning">
                <img src="images/dog-beginning.png" class="beginning-dog" alt="">
                <img src="images/books.png" class="books" alt="">
                <img src="images/flashlight.png" class="flashlight" alt="">
            </div>
        `,
        momentum: `
            <div class="dog-scene-momentum">
                <img src="images/dog-momentum.png" class="momentum-dog" alt="">
                <img src="images/dumbells.png" class="dumbells" alt="">
                <img src="images/ball.png" class="ball" alt="">
            </div>
        `,
        skybound: `
            <div class="dog-scene-skybound">
                <img src="images/dog-skybound.png" class="skybound-dog" alt="">
                <img src="images/bird.png" class="bird" alt="">
            </div>
        `,
        moonbound: `
            <div class="dog-scene-moonbound">
                <img src="images/dog-moonbound.png" class="moonbound-dog" alt="">
                <img src="images/moon.png" class="moon" alt="">
            </div>
        `
    };

    function clearDesktopPeekMessages(){
        document.querySelectorAll(".phase-peek-message").forEach(message => {
            message.innerHTML = "";
            message.classList.remove("show");
        });
    }

    function clearMobilePeekMessage(){
        const mobilePeek = document.querySelector(".mobile-peek-message");

        if(mobilePeek){
            mobilePeek.innerHTML = "";
            mobilePeek.classList.remove("show");
        }
    }

    function syncPeekMessagesForViewport(){

        const viewedPhase = mobileViewedPhase || currentPhaseId;

        if(!viewedPhase || !currentPhaseId) return;

        if(window.innerWidth <= 768){

            clearDesktopPeekMessages();

            updateMobilePeekMessage(
                viewedPhase,
                viewedPhase !== currentPhaseId
            );

        }
        else{

            clearMobilePeekMessage();

        }

    }

    function showPhase(phaseId, isManualClick = false){

        document.querySelectorAll(".phase-content").forEach(content => {
            content.classList.remove("active");
            content.classList.remove("sneak-peek");
        });

        const activeContent =
            document.querySelector(`.phase-content[data-phase="${phaseId}"]`);

        if(activeContent){

            activeContent.classList.add("active");

            if(isManualClick && window.innerWidth > 768){
                const contentPanel = document.querySelector(".content-panel");

                if(contentPanel){
                    contentPanel.scrollIntoView({
                        behavior:"smooth",
                        block:"start"
                    });
                }
            }

            if(isManualClick && phaseId !== currentPhaseId){
                activeContent.classList.add("sneak-peek");
            }

            if(window.innerWidth > 768){
                clearMobilePeekMessage();
                updatePeekMessage(activeContent, phaseId, isManualClick);
            }
            else{
                clearDesktopPeekMessages();
            }
        }

        updateMobileTimelineText(phaseId);
        updateMobileArrows(phaseId);
        updateMobileScenes(phaseId);

        if(window.innerWidth <= 768){
            updateMobilePeekMessage(phaseId, isManualClick);
        }
        else{
            clearMobilePeekMessage();
        }

    }

    function updateMobileTimelineText(phaseId){

        const title = document.querySelector(".mobile-timeline-title");
        const price = document.querySelector(".mobile-timeline-price");
        const tag = document.querySelector(".mobile-current-tag");

        if(!title || !price) return;

        title.textContent = phaseText[phaseId].title;
        price.textContent = phaseText[phaseId].price;

        if(tag){
            tag.textContent =
                phaseId === currentPhaseId
                ? "CURRENT PHASE"
                : "SNEAK PEEK";
        }

    }

    function updateMobilePeekMessage(phaseId, isManualClick){

        const mobilePeek =
            document.querySelector(".mobile-peek-message");

        if(!mobilePeek) return;

        if(isManualClick && phaseId !== currentPhaseId){

            mobilePeek.innerHTML =
                `Not the current phase. Just taking a peek!
                <span class="back-current-phase">
                    ← Back to Current Phase
                </span>`;

            mobilePeek.classList.add("show");

        }
        else{

            mobilePeek.innerHTML = "";
            mobilePeek.classList.remove("show");

        }

    }

    function updateMobileArrows(phaseId){

        const prevButton = document.getElementById("mobilePrevPhase");
        const nextButton = document.getElementById("mobileNextPhase");

        if(!prevButton || !nextButton) return;

        prevButton.classList.remove("disabled");
        nextButton.classList.remove("disabled");

        if(phaseId === "bottom"){
            prevButton.classList.add("disabled");
        }

        if(phaseId === "moonbound"){
            nextButton.classList.add("disabled");
        }

    }

    function updateMobileScenes(phaseId){

        const prevScene = document.querySelector(".mobile-prev-scene");
        const currentScene = document.querySelector(".mobile-current-scene");
        const nextScene = document.querySelector(".mobile-next-scene");

        if(!prevScene || !currentScene || !nextScene) return;

        const currentIndex = phaseOrder.indexOf(phaseId);

        const prevPhase =
            currentIndex > 0
            ? phaseOrder[currentIndex - 1]
            : null;

        const nextPhase =
            currentIndex < phaseOrder.length - 1
            ? phaseOrder[currentIndex + 1]
            : null;

        prevScene.innerHTML =
            prevPhase ? mobileScenes[prevPhase] : "";

        currentScene.innerHTML =
            mobileScenes[phaseId];

        nextScene.innerHTML =
            nextPhase ? mobileScenes[nextPhase] : "";

    }

    function updatePeekMessage(activeContent, phaseId, isManualClick){

        const topInfo =
            activeContent.querySelector(".phase-info-top-right");

        if(!topInfo) return;

        let peekMessage =
            topInfo.querySelector(".phase-peek-message");

        if(!peekMessage){

            peekMessage = document.createElement("div");
            peekMessage.className = "phase-peek-message";

            const title =
                topInfo.querySelector(".right-phase-title");

            title.insertAdjacentElement("afterend", peekMessage);

        }

        if(isManualClick && phaseId !== currentPhaseId){

            peekMessage.innerHTML =
                `Not the current phase. Just taking a peek!
                <span class="back-current-phase">
                    ← Back to Current Phase
                </span>`;

            peekMessage.classList.add("show");

        }
        else{
            peekMessage.textContent = "";
            peekMessage.classList.remove("show");
        }

    }

    function getPhaseFromPrice(price){

        if(price < 0.001) return "bottom";
        if(price < 0.01) return "beginning";
        if(price < 0.10) return "momentum";
        if(price < 1.00) return "skybound";

        return "moonbound";

    }

    document.querySelectorAll(".phase-trigger").forEach(trigger => {

        trigger.addEventListener("click", () => {

            const phaseId =
                trigger.getAttribute("data-phase");

            mobileViewedPhase = phaseId;

            showPhase(phaseId, true);

        });

    });

    document.getElementById("mobilePrevPhase")?.addEventListener("click", () => {

        if(!mobileViewedPhase){
            mobileViewedPhase = currentPhaseId;
        }

        const currentIndex =
            phaseOrder.indexOf(mobileViewedPhase);

        if(currentIndex <= 0) return;

        mobileViewedPhase =
            phaseOrder[currentIndex - 1];

        showPhase(mobileViewedPhase, true);

    });

    document.getElementById("mobileNextPhase")?.addEventListener("click", () => {

        if(!mobileViewedPhase){
            mobileViewedPhase = currentPhaseId;
        }

        const currentIndex =
            phaseOrder.indexOf(mobileViewedPhase);

        if(currentIndex >= phaseOrder.length - 1) return;

        mobileViewedPhase =
            phaseOrder[currentIndex + 1];

        showPhase(mobileViewedPhase, true);

    });

    document.addEventListener("click", event => {

        if(!event.target.classList.contains("back-current-phase")) return;

        mobileViewedPhase = currentPhaseId;

        showPhase(currentPhaseId, false);

        scrollTimelineToCurrentDog(currentPhaseId);

    });

    function scrollTimelineToCurrentDog(phaseId){

        const timelinePanel =
            document.querySelector(".timeline-panel");

        if(!timelinePanel) return;

        if(phaseId === "bottom"){

            timelinePanel.scrollTo({
                top:0,
                behavior:"smooth"
            });

            return;

        }

        const phaseDogScene =
        timelinePanel.querySelector(`.dog-scene-${phaseId}`);

        if(!phaseDogScene) return;

        const panelRect =
            timelinePanel.getBoundingClientRect();

        const dogRect =
            phaseDogScene.getBoundingClientRect();

        const extraSpaceAboveDog = 10;

        const targetScroll =
            timelinePanel.scrollTop +
            dogRect.top -
            panelRect.top -
            extraSpaceAboveDog;

        timelinePanel.scrollTo({
            top:targetScroll,
            behavior:"smooth"
        });

    }

    async function loadDogPrice(){

        try{

            const response = await fetch(
                "https://api.coingecko.com/api/v3/simple/price?ids=dog-go-to-the-moon-rune&vs_currencies=usd&include_24hr_change=true"
            );

            const data = await response.json();

            const price =
                data["dog-go-to-the-moon-rune"].usd;

            const change =
                data["dog-go-to-the-moon-rune"].usd_24h_change;

            localStorage.setItem("dogLastPrice", price);
            localStorage.setItem("dogLastChange", change);

            updateSiteWithPrice(price, change);

        }
        catch(error){

            console.log("CoinGecko Error", error);

            const savedPrice =
                localStorage.getItem("dogLastPrice");

            const savedChange =
                localStorage.getItem("dogLastChange");

            if(savedPrice && savedChange){

                updateSiteWithPrice(
                    Number(savedPrice),
                    Number(savedChange)
                );

            }

        }

    }

    function updateSiteWithPrice(price, change){

        const currentPhase =
            getPhaseFromPrice(price);

        currentPhaseId = currentPhase;

        if(!hasInitialPriceLoaded){

            showPhase(currentPhase, false);

            document.body.classList.remove("is-loading");
            hideSiteLoader();

            setTimeout(() => {
                updatePriceDisplay(price, change);
                scrollTimelineToCurrentDog(currentPhase);
            }, 100);

            hasInitialPriceLoaded = true;

        }
        else{

            updatePriceDisplay(price, change);

        }

    }

    function updateTimelineMarker(price){

        const currentPhase =
            getPhaseFromPrice(price);

        const phaseRanges = {
            bottom: { min: 0.0001, max: 0.001 },
            beginning: { min: 0.001, max: 0.01 },
            momentum: { min: 0.01, max: 0.10 },
            skybound: { min: 0.10, max: 1.00 },
            moonbound: { min: 1.00, max: 1.00 }
        };

        const dotPositions = [
            { left: 95, top: 0 },
            { left: 110, top: 39 },
            { left: 117, top: 84 },
            { left: 105, top: 137 },
            { left: 95, top: 184 }
        ];

        document.querySelectorAll(".timeline-marker").forEach(marker => {
            marker.classList.remove("active");
        });

        document.querySelectorAll(".timeline-dot").forEach(dot => {
            dot.classList.remove("marker-hidden");
        });

        if(!phaseRanges[currentPhase]) return;

        const range =
            phaseRanges[currentPhase];

        let progress =
            ((price - range.min) /
            (range.max - range.min)) * 100;

        progress =
            Math.max(0, Math.min(progress, 100));

        let dotIndex =
            Math.min(Math.floor(progress / 20), 4);

        const dotGroup =
            document.querySelector(
                `.timeline-dots[data-phase="${currentPhase}"],
                 .timeline-dots-beginning[data-phase="${currentPhase}"],
                 .timeline-dots-momentum[data-phase="${currentPhase}"],
                 .timeline-dots-skybound[data-phase="${currentPhase}"]`
            );

        if(!dotGroup) return;

        const marker =
            dotGroup.querySelector(".timeline-marker");

        const dotToHide =
            dotGroup.querySelector(`.dot-${dotIndex + 1}`);

        if(marker){

            marker.classList.add("active");

            marker.style.left =
                dotPositions[dotIndex].left + "px";

            marker.style.top =
                dotPositions[dotIndex].top + "px";

        }

        if(dotToHide){
            dotToHide.classList.add("marker-hidden");
        }

    }

    function updatePriceDisplay(price, change){

        document.querySelectorAll(".right-price-line").forEach(item => {

            const changeText =
                change >= 0
                ? "+" + change.toFixed(2)
                : change.toFixed(2);

            item.textContent =
                `$${price.toFixed(8)} / ${changeText}% (24h)`;

            item.classList.remove("price-up", "price-down");

            if(change >= 0){
                item.classList.add("price-up");
            }
            else{
                item.classList.add("price-down");
            }

        });

        updateProgressBars(price);
        updateTimelineMarker(price);

    }

    function updateProgressBars(price){

        let phaseMin = 0.0001;
        let phaseMax = 0.001;

        if(price < 0.001){
            phaseMin = 0.0001;
            phaseMax = 0.001;
        }
        else if(price < 0.01){
            phaseMin = 0.001;
            phaseMax = 0.01;
        }
        else if(price < 0.10){
            phaseMin = 0.01;
            phaseMax = 0.10;
        }
        else{
            phaseMin = 0.10;
            phaseMax = 1.00;
        }

        const nextPhaseProgress =
            Math.max(0, Math.min(((price - phaseMin) / (phaseMax - phaseMin)) * 100, 100));

        const dollarProgress =
            Math.min(price * 100, 100);

        const activeContent =
            document.querySelector(".phase-content.active");

        if(!activeContent) return;

        const bars =
            activeContent.querySelectorAll(".progress-fill");

        const percents =
            activeContent.querySelectorAll(".progress-percent");

        if(bars.length >= 2){

            bars[0].style.transition = "none";
            bars[1].style.transition = "none";

            bars[0].style.width = "0%";
            bars[1].style.width = "0%";

            bars[0].offsetWidth;

            setTimeout(() => {
                bars[0].style.transition = "width 1.2s ease-out";
                bars[1].style.transition = "width 1.2s ease-out";

                bars[0].style.width = nextPhaseProgress + "%";
                bars[1].style.width = dollarProgress + "%";
            }, 50);

        }

        if(percents.length >= 2){

            percents[0].textContent =
                nextPhaseProgress.toFixed(0) + "%";

            percents[1].textContent =
                dollarProgress.toFixed(2) + "%";

        }

    }

    const footer =
        document.querySelector(".site-footer");

    if(footer){

        const footerObserver =
            new IntersectionObserver(entries => {

                entries.forEach(entry => {

                    if(entry.isIntersecting){
                        footer.classList.add("animate-footer");
                        footerObserver.unobserve(footer);
                    }

                });

            }, {
                threshold:0.25
            });

        footerObserver.observe(footer);

    }

    window.addEventListener("resize", () => {
        syncPeekMessagesForViewport();
    });

    const creatorIcon = document.getElementById("creator-icon");
    const leonidasLink = document.getElementById("leonidas-link");

    if (creatorIcon && leonidasLink) {
        let clicked = false;

        leonidasLink.addEventListener("mouseenter", () => {
            creatorIcon.src = "images/why-4-mo.png";
        });

        leonidasLink.addEventListener("mouseleave", () => {
            if (!clicked) {
                creatorIcon.src = "images/why-4.png";
            }
        });

        leonidasLink.addEventListener("click", () => {
            clicked = true;
            creatorIcon.src = "images/why-4-mo.png";
        });
    }

    if (document.body.classList.contains("error-page")) {
        document.querySelectorAll(".phase-trigger, .timeline-dot, .mobile-timeline-arrow").forEach(item => {
            item.addEventListener("click", () => {
                window.location.href = "/";
            });
        });
    }

    loadDogPrice();

    setInterval(() => {
        loadDogPrice();
    }, 60000);

});
