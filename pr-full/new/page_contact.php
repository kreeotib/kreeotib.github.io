<?php
/**
 * The template for displaying pages
 *
 * This is the template that displays all pages by default.
 * Please note that this is the WordPress construct of pages and that
 * other "pages" on your WordPress site will use a different template.
 *
 * @package WordPress
 * @subpackage Twenty_Fifteen
 * @since Twenty Fifteen 1.0
 */
/*
Template Name: Контакты
*/
get_header(); ?>
   <main class="content">
        <div class="hero animation-wrapper">
            <div class="hero__wrapper">
                <img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/hero/main.webp" alt="" class="hero__bg">
                <div class="container">
                    <div class="hero__content">
                        <div class="hero-header">
                            <p class="title title--big animation-item-text">
                                Контакты
                            </p>
                        </div>
                        <div class="hero-footer">
                            <div class="contact-grid">
                                <div class="contact-block">
                                    <p class="text text--middle text--accent text--semibold animation-item-text">
                                        Центральный офис
                                    </p>
                                    <p class="title title--base animation-item-text">
                                        <?=get_field('адрес','options')?>
                                    </p>
                                </div>
                                <div class="contact-grid__column">
                                    <div class="contact-block">
                                        <p class="text text--middle text--accent text--semibold animation-item-text">
                                            Телефон:
                                        </p>
                                        <a href="tel:<?=get_field('телефон_для_ссылки','options')?>" class="title title--base animation-item-text">
                                            <?=get_field('телефон','options')?>
                                        </a>
                                    </div>
                                    <div class="contact-block">
                                        <p class="text text--middle text--accent text--semibold animation-item-text">
                                            Почта:
                                        </p>

                                        <a href="mailto:<?=get_field('email','options')?>" class="title title--base animation-item-text">
                                            <?=get_field('email','options')?>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="section animation-wrapper">
            <div class="section__wrapper section__wrapper--big">
                <div class="container">
                    <div class="section-header">
                        <p class="text text--middle">
                            <?=get_field('rukovodstvo')['zagolovok_bloka']?>
                        </p>
                    </div>
                    <div class="management-grid">
                          <div class="management-item management-item--person animation-item">
                                                    <div class="management-item__wrapper">
                                                        <img src="assets/images/managment/1.webp" alt="" class="management-item__bg">
                                                        <div class="management-item__content">
                                                            <p class="management-item__title">
                                                                Татьяна Яновна
                                                            </p>
                                                            <p class="management-item__text">
                                                                Co-founder
                                                            </p>
                                                        </div>
                                                        <div class="management-item__content management-item__content--hidden">
                                                            <a href="mailto:kolyada.m@ulgroup.ru" class="management-item__text">
                                                                kolyada.m@ulgroup.ru
                                                                <br>
                                                                <br>
                                                            </a>
                                                            <a href="tel:+7 (495) 783-83-83" class="management-item__text">
                                                                +7 (495) 783-83-83, доб. 5863
                                                            </a>
                                                            <a href="tel:+7 (905) 759-22-46" class="management-item__text">
                                                                +7 (905) 759-22-46
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="management-item management-item--person animation-item">
                                                    <div class="management-item__wrapper">
                                                        <img src="assets/images/managment/2.webp" alt="" class="management-item__bg">
                                                        <div class="management-item__content">
                                                            <p class="management-item__title">
                                                                Михаил Олегович
                                                            </p>
                                                            <p class="management-item__text">
                                                                Co-founder
                                                            </p>
                                                        </div>
                                                        <div class="management-item__content management-item__content--hidden">
                                                            <a href="mailto:kolyada.m@ulgroup.ru" class="management-item__text">
                                                                kolyada.m@ulgroup.ru
                                                                <br>
                                                                <br>
                                                            </a>
                                                            <a href="tel:+7 (495) 783-83-83" class="management-item__text">
                                                                +7 (495) 783-83-83, доб. 5863
                                                            </a>
                                                            <a href="tel:+7 (905) 759-22-46" class="management-item__text">
                                                                +7 (905) 759-22-46
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="management-item management-item--person animation-item">
                                                    <div class="management-item__wrapper">
                                                        <img src="assets/images/managment/3.webp" alt="" class="management-item__bg">
                                                        <div class="management-item__content">
                                                            <p class="management-item__title">
                                                                Татьяна Яновна
                                                            </p>
                                                            <p class="management-item__text">
                                                                Co-founder
                                                            </p>
                                                        </div>
                                                        <div class="management-item__content management-item__content--hidden">
                                                            <a href="mailto:kolyada.m@ulgroup.ru" class="management-item__text">
                                                                kolyada.m@ulgroup.ru
                                                                <br>
                                                                <br>
                                                            </a>
                                                            <a href="tel:+7 (495) 783-83-83" class="management-item__text">
                                                                +7 (495) 783-83-83, доб. 5863
                                                            </a>
                                                            <a href="tel:+7 (905) 759-22-46" class="management-item__text">
                                                                +7 (905) 759-22-46
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="management-item animation-item">
                                                    <div class="management-item__wrapper management-item__wrapper--black">
                                                        <div class="management-item__content">
                                                            <p class="title title--big">
                                                                100
                                                            </p>
                                                            <p class="text text--middle">
                                                                Постоянных клиентов
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="management-item management-item--person animation-item">
                                                    <div class="management-item__wrapper">
                                                        <img src="assets/images/managment/1.webp" alt="" class="management-item__bg">
                                                        <div class="management-item__content">
                                                            <p class="management-item__title">
                                                                Татьяна Яновна
                                                            </p>
                                                            <p class="management-item__text">
                                                                Co-founder
                                                            </p>
                                                        </div>
                                                        <div class="management-item__content management-item__content--hidden">
                                                            <a href="mailto:kolyada.m@ulgroup.ru" class="management-item__text">
                                                                kolyada.m@ulgroup.ru
                                                                <br>
                                                                <br>
                                                            </a>
                                                            <a href="tel:+7 (495) 783-83-83" class="management-item__text">
                                                                +7 (495) 783-83-83, доб. 5863
                                                            </a>
                                                            <a href="tel:+7 (905) 759-22-46" class="management-item__text">
                                                                +7 (905) 759-22-46
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="management-item animation-item">
                                                    <div class="management-item__wrapper management-item__wrapper--black">
                                                        <div class="management-item__content">
                                                            <p class="title title--green title--big">
                                                                200+
                                                            </p>
                                                            <p class="text text--middle">
                                                                Контрактов
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                    </div>
                </div>
            </div>
            <div class="container">
                <div class="section-divider"></div>

            </div>
        </div>
        <div class="section-bg">
            <img class="section-bg__gradient section-bg__gradient--contact" loading="lazy" src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/gradients/contact.png" alt="">
            <div class="section section-slider animation-wrapper">
                <div class="section__wrapper section__wrapper--big">
                    <div class="container">
                        <div class="section-header">
                            <p class="text text--middle animation-item-text">
                                <?=get_field('partnery_i_klienty')['zagolovok']?>
                            </p>
                        </div>
                        <p class="title title--base title--mobile--big title--center animation-item-text">
                            <?=get_field('partnery_i_klienty')['tekst_sverhu']?>
                        </p>
                    </div>
                </div>
                <div class="container animation-wrapper">
                    <div class="section__grid">
                        <div class="section__wrapper section__wrapper--big">
                            <p class="title title--base title--mobile--big animation-item-text">
                               <?=get_field('partnery_i_klienty')['tekst_sleva']?>
                            </p>
                        </div>
                        <div class="section-train">
                            <div class="section-train__item">
                                <img src="<?=get_field('partnery_i_klienty')['kartinka_sprava']['sizes']['1536x1536']?>" alt="">
                            </div>
                        </div>
                    </div>
                </div>


                <?php if(get_field('partnery_i_klienty')['partnery']!=''){?>
                <div class="section__wrapper animation-wrapper">
                    <div class="container">
                        <div class="partners-slider swiper slider">
                            <div class="swiper-wrapper">
<? $lists=get_field('partnery_i_klienty')['partnery'];   
        foreach($lists as $list){
?> 
                                <div class="swiper-slide partners-slider__item partners-item animation-item">
                                    <div class="partners-item__wrapper">
                                        <img src="<?=$list['sizes']['medium_large']?>" alt="" class="partners-item__img">
                                    </div>
                                </div>

     <?php }?>
                            </div>
                            <div class="slider-navigation">
                                <a href="#" class="slider-button slider-button--prev">
                                    <svg class="icon">
                                        <use xlink:href="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/sprite.svg#arrow"></use>
                                    </svg>
                                </a>
                                <a href="#" class="slider-button slider-button--next">
                                    <svg class="icon">
                                        <use xlink:href="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/sprite.svg#arrow"></use>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
<?php }?>


            </div>
        </div>
        <div class="section animation-wrapper">
            <div class="section__wrapper">
                <div class="container">
                    <div class="form">
                        <div class="form__box">
                            <p class="form__title title title--base title--mobile--big animation-item-text">
                                <?=get_field('onlajn_zayavka')['zagolovok_bloka']?>
                            </p>
    <?php
                 $form=do_shortcode('[contact-form-7 id="d663d70" title="Контакты"]');
               echo  str_replace(array('<br />','<p>','</p>'),'',$form);?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="section animation-wrapper">
            <div class="section__wrapper section__wrapper--big">
                <div class="banner">
                    <div class="container">
                        <div class="banner__wrapper" style="background: url(<?=get_field('blok_vzaimovygodnye_otnosheniya')['картинка']['sizes']['2048x2048']?>) center center / cover no-repeat;">
                            <div class="banner__row">
                                <p class="banner__title title title--base title--mobile--big animation-item-text">
                                   <?=get_field('blok_vzaimovygodnye_otnosheniya')['текст']?>
                                </p>
                                <a href="<?=get_field('blok_vzaimovygodnye_otnosheniya')['кнопка']['ссылка']?>" data-popup=".popup-form"
                                   class="button button--big button--bordered">
                                    <?=get_field('blok_vzaimovygodnye_otnosheniya')['кнопка']['текст']?>
                                    <svg class="button__icon">
                                        <use xlink:href="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/sprite.svg#arrow"></use>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
  <?php  get_footer(); ?>