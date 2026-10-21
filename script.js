/**
 * AURA EV - Scroll Reveal & Interactive UI Engine
 * Tối ưu hóa hiệu suất với Intersection Observer API
 * =========================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. CẤU HÌNH & KHỞI TẠO INTERSECTION OBSERVER CHO SCROLL REVEAL
    initScrollReveal();

    // 2. KHU VỰC TRƯNG BÀY SẢN PHẨM & ĐỔI MÀU SẮC (Fade Transition)
    initProductColorSwitcher();

    // 3. CÁC TÍNH NĂNG UX BỔ TRỢ (Navbar Glass & Mobile Menu)
    initNavbarScrollEffect();
    initMobileMenu();
    initSmoothAnchorScroll();

    // 4. TIỆN ÍCH STICKY ZALO CHAT & GỢI Ý TƯƠNG TÁC
    initStickyZaloWidget();
});

/**
 * Hiệu ứng Scroll Reveal tối ưu với IntersectionObserver API
 * Các khối nội dung (About, Features, Gallery) sẽ mờ dần và trượt từ dưới lên khi cuộn tới.
 */
function initScrollReveal() {
    // Kiểm tra xem trình duyệt có hỗ trợ IntersectionObserver không
    if (!('IntersectionObserver' in window)) {
        // Fallback cho trình duyệt cũ: hiển thị tất cả ngay lập tức
        document.querySelectorAll('.reveal, .reveal-child').forEach(el => {
            el.classList.add('revealed');
        });
        return;
    }

    // Tôn trọng thiết lập giảm chuyển động của người dùng (Accessibility - a11y)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        document.querySelectorAll('.reveal, .reveal-child').forEach(el => {
            el.classList.add('revealed');
        });
        return;
    }

    /**
     * Tùy chọn cho Intersection Observer:
     * - root: null (quan sát theo khung nhìn trình duyệt - viewport)
     * - rootMargin: '0px 0px -60px 0px' (kích hoạt khi phần tử còn cách đáy viewport 60px để hiệu ứng xuất hiện tự nhiên)
     * - threshold: 0.15 (kích hoạt khi ít nhất 15% diện tích phần tử xuất hiện trong khung nhìn)
     */
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.15
    };

    // Callback xử lý khi phần tử giao cắt với viewport
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;

                // Thêm class 'revealed' để kích hoạt CSS transition (opacity: 1, translateY: 0)
                target.classList.add('revealed');

                // Nếu trong khối có các phần tử con (.reveal-child), tạo hiệu ứng so le (staggered delay)
                const children = target.querySelectorAll('.reveal-child');
                children.forEach((child, index) => {
                    child.style.transitionDelay = `${(index + 1) * 0.12}s`;
                    child.classList.add('revealed');
                });

                // TỐI ƯU HIỆU SUẤT: Huỷ theo dõi sau khi đã hiển thị xong để giải phóng bộ nhớ và CPU
                observer.unobserve(target);
            }
        });
    };

    // Khởi tạo Observer
    const revealObserver = new IntersectionObserver(revealCallback, observerOptions);

    // Lắng nghe tất cả các khối nội dung chính (.reveal) bao gồm #about, #features, #gallery
    const revealSections = document.querySelectorAll('.reveal');
    revealSections.forEach(section => {
        revealObserver.observe(section);
    });
}

/**
 * Khu vực trưng bày sản phẩm - Đổi màu xe kèm hiệu ứng Fade Transition mượt mà
 */
function initProductColorSwitcher() {
    const productImg = document.getElementById('product-main-image');
    const colorLabel = document.getElementById('current-color-label');
    const colorButtons = document.querySelectorAll('.color-circle');
    const stageGlow = document.getElementById('stage-glow');

    if (!productImg || !colorButtons.length) return;

    // Tối ưu UX: Tải trước (Preload) tất cả các ảnh màu để khi click ảnh đổi tức thì, không bị giật lag
    colorButtons.forEach(btn => {
        const imgSrc = btn.dataset.img;
        if (imgSrc) {
            const preloader = new Image();
            preloader.src = imgSrc;
        }
    });

    // Lắng nghe sự kiện click trên từng nút màu
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Nếu màu đang được chọn thì không làm gì
            if (button.classList.contains('active')) return;

            const newImgSrc = button.dataset.img;
            const newColorName = button.dataset.name;
            const newGlowColor = button.dataset.glow;

            // 1. Cập nhật trạng thái active cho các nút màu
            colorButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-checked', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-checked', 'true');

            // 2. Bắt đầu Fade-out (Mờ dần & thu nhỏ nhẹ ảnh hiện tại)
            productImg.classList.add('fade-out');

            // 3. Sau khoảng thời gian chuyển tiếp (260ms), đổi nguồn ảnh và Fade-in trở lại
            setTimeout(() => {
                productImg.src = newImgSrc;
                productImg.alt = `AURA Hyper GT - ${newColorName}`;

                // Cập nhật tên nhãn màu với hiệu ứng đổi chữ
                if (colorLabel) {
                    colorLabel.textContent = newColorName;
                }

                // Cập nhật quầng sáng dưới sàn xe phù hợp với màu sơn
                if (stageGlow && newGlowColor) {
                    stageGlow.style.background = `radial-gradient(ellipse at center, ${newGlowColor} 0%, transparent 70%)`;
                }

                // Khi ảnh mới sẵn sàng, bỏ class fade-out để kích hoạt Fade-in
                productImg.onload = () => {
                    productImg.classList.remove('fade-out');
                };

                // Dự phòng trường hợp ảnh đã được cache sẵn trong bộ nhớ
                setTimeout(() => {
                    productImg.classList.remove('fade-out');
                }, 50);
            }, 260);
        });
    });
}

/**
 * Hiệu ứng thanh Navbar tự động đổi độ mờ kính (Glassmorphism) khi cuộn
 */
function initNavbarScrollEffect() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/**
 * Điều khiển Menu trên thiết bị di động
 */
function initMobileMenu() {
    const toggleBtn = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        }
    });

    // Đóng menu khi nhấp vào một link điều hướng
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.classList.add('fa-bars');
                icon.classList.remove('fa-xmark');
            }
        });
    });
}

/**
 * Cuộn mượt đến các vị trí liên kết trong trang (Smooth Anchor Scroll)
 */
function initSmoothAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const navHeight = document.getElementById('navbar')?.offsetHeight || 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Điều khiển Widget Sticky Chat Zalo
 * Quản lý đóng/mở Callout gợi ý và tối ưu trải nghiệm tương tác
 */
function initStickyZaloWidget() {
    const callout = document.getElementById('zalo-callout');
    const closeBtn = document.getElementById('zalo-callout-close');
    const zaloBtn = document.getElementById('zalo-chat-btn');

    if (!callout) return;

    // Đóng hộp gợi ý khi người dùng click vào dấu nhân (x)
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            callout.classList.add('hidden');
        });
    }

    // Tự động ẩn callout nếu người dùng đã click mở chat
    if (zaloBtn) {
        zaloBtn.addEventListener('click', () => {
            callout.classList.add('hidden');
        });
    }
}

