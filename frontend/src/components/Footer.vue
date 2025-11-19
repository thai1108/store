<template>
    <footer class="site-footer">
        <div class="footer-container">
            <div class="footer-content">
                <!-- Contact Section -->
                <div class="footer-section">
                    <h3 class="footer-title">{{ $t("footer.contact") }}</h3>
                    <div class="contact-info">
                        <div class="info-item">
                            <EnvironmentOutlined class="icon" />
                            <a href="https://maps.google.com/maps/dir//18.8211406,105.5481013/@18.8211406,105.5481013,15z"
                                target="_blank" rel="noopener noreferrer">
                                Xóm 10, xã Nghi Lâm, huyện Nghi Lộc, tỉnh Nghệ An
                            </a>
                        </div>
                        <div class="info-item">
                            <PhoneOutlined class="icon" />
                            <span>
                                <a href="tel:0396454013">0396454013</a> /
                                <a href="tel:0965029665">0965029665</a>
                            </span>
                        </div>
                        <div class="info-item">
                            <FacebookOutlined class="icon" />
                            <div class="social-links">
                                <a href="https://fb.com/nhungan156" target="_blank" rel="noopener noreferrer">
                                    fb.com/nhungan156
                                </a>
                                <a href="https://fb.com/thumy0908" target="_blank" rel="noopener noreferrer">
                                    fb.com/thumy0908
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Map Section -->
                <div class="footer-section map-section">
                    <h3 class="footer-title">{{ $t("footer.location") }}</h3>
                    <div class="map-container">
                        <iframe src="https://maps.google.com/maps?q=18.8211406,105.5481013&z=15&output=embed"
                            height="300" width="100%" style="border: 0; border-radius: 8px" allowfullscreen
                            loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <p>
                    &copy; {{ currentYear }} 2CE
                    <!-- {{ $t("footer.allRightsReserved") }} -->
                </p>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
    EnvironmentOutlined,
    PhoneOutlined,
    FacebookOutlined,
} from "@ant-design/icons-vue";

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.site-footer {
    background: #ffffff;
    border-top: 1px solid #f0f0f0;
    padding: 48px 0 24px;
    margin-top: 60px;
    font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
        Cantarell, sans-serif;
}

.footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}

.footer-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    margin-bottom: 32px;
}

.footer-section {
    display: flex;
    flex-direction: column;
}

.map-section {
    grid-column: span 1;
}

.footer-title {
    color: #262626;
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 20px 0;
    padding-bottom: 12px;
    border-bottom: 2px solid #1890ff;
    width: fit-content;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 14px;
    line-height: 1.6;
    color: #595959;
}

.info-item .icon {
    font-size: 18px;
    color: #1890ff;
    margin-top: 2px;
    flex-shrink: 0;
}

.info-item a {
    color: #1890ff;
    text-decoration: none;
    transition: color 0.3s;
}

.info-item a:hover {
    color: #40a9ff;
    text-decoration: underline;
}

.social-links {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.social-links a {
    color: #1890ff;
    text-decoration: none;
    transition: color 0.3s;
}

.social-links a:hover {
    color: #40a9ff;
    text-decoration: underline;
}

.map-container {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.map-container iframe {
    display: block;
    width: 100%;
}

.footer-bottom {
    text-align: center;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
    margin-top: 32px;
}

.footer-bottom p {
    margin: 0;
    font-size: 14px;
    color: #8c8c8c;
}

/* Responsive */
@media (max-width: 992px) {
    .footer-content {
        grid-template-columns: 1fr;
        gap: 32px;
    }

    .map-section {
        grid-column: span 1;
    }
}

@media (max-width: 768px) {
    .site-footer {
        padding: 32px 0 16px;
        margin-top: 40px;
    }

    .footer-container {
        padding: 0 16px;
    }

    .footer-content {
        gap: 28px;
    }

    .footer-title {
        font-size: 16px;
    }

    .info-item {
        font-size: 13px;
    }

    .map-container iframe {
        height: 200px;
    }
}
</style>
