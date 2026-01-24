import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight, Circle, Pause, Play } from 'lucide-react';

/**
 * Batch 102: Carousel Component
 *
 * Carousel and slider components for cycling through content.
 *
 * Exports:
 * - Carousel: Basic carousel
 * - CarouselSlide: Individual slide
 * - CarouselNav: Navigation arrows
 * - CarouselDots: Dot indicators
 * - ImageCarousel: Image-focused carousel
 * - CardCarousel: Card carousel
 * - TestimonialCarousel: Testimonial slider
 * - HeroCarousel: Full-width hero carousel
 * - ThumbnailCarousel: Carousel with thumbnails
 * - AutoplayCarousel: Auto-advancing carousel
 */

// ============================================================================
// CAROUSEL - Basic carousel
// ============================================================================
export function Carousel({
  children,
  autoplay = false,
  autoplayInterval = 5000,
  loop = true,
  showArrows = true,
  showDots = true,
  slidesToShow = 1,
  gap = 16,
  className,
  ...props
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const containerRef = useRef(null);
  const slides = React.Children.toArray(children);
  const totalSlides = slides.length;
  const maxIndex = Math.max(0, totalSlides - slidesToShow);

  const goTo = useCallback((index) => {
    if (loop) {
      setCurrentIndex((index + totalSlides) % totalSlides);
    } else {
      setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
    }
  }, [loop, totalSlides, maxIndex]);

  const goNext = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  // Autoplay
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(goNext, autoplayInterval);
    return () => clearInterval(interval);
  }, [isPlaying, goNext, autoplayInterval]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };

    const container = containerRef.current;
    container?.addEventListener('keydown', handleKeyDown);
    return () => container?.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev]);

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      tabIndex={0}
      {...props}
    >
      {/* Slides container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
            gap: `${gap}px`,
          }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{ width: `calc(${100 / slidesToShow}% - ${gap * (slidesToShow - 1) / slidesToShow}px)` }}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {showArrows && totalSlides > slidesToShow && (
        <CarouselNav
          onPrev={goPrev}
          onNext={goNext}
          canGoPrev={loop || currentIndex > 0}
          canGoNext={loop || currentIndex < maxIndex}
        />
      )}

      {/* Dots */}
      {showDots && totalSlides > slidesToShow && (
        <CarouselDots
          total={loop ? totalSlides : maxIndex + 1}
          current={currentIndex}
          onChange={goTo}
          className="mt-4"
        />
      )}

      {/* Autoplay control */}
      {autoplay && (
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// CAROUSEL SLIDE - Individual slide
// ============================================================================
export function CarouselSlide({
  children,
  className,
  ...props
}) {
  return (
    <div className={cn('w-full', className)} {...props}>
      {children}
    </div>
  );
}

// ============================================================================
// CAROUSEL NAV - Navigation arrows
// ============================================================================
export function CarouselNav({
  onPrev,
  onNext,
  canGoPrev = true,
  canGoNext = true,
  variant = 'overlay',
  className,
  ...props
}) {
  const variantClasses = {
    overlay: 'absolute inset-y-0 flex items-center',
    outside: 'absolute -left-12 -right-12 inset-y-0 flex items-center justify-between pointer-events-none',
  };

  const buttonClasses = cn(
    'p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
    variant === 'overlay'
      ? 'bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 shadow-lg'
      : 'bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 pointer-events-auto'
  );

  if (variant === 'outside') {
    return (
      <div className={cn(variantClasses[variant], className)} {...props}>
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className={cn(buttonClasses, !canGoPrev && 'opacity-50 cursor-not-allowed')}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={cn(buttonClasses, !canGoNext && 'opacity-50 cursor-not-allowed')}
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={cn(variantClasses[variant], 'left-4', className)} {...props}>
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className={cn(buttonClasses, !canGoPrev && 'opacity-50 cursor-not-allowed')}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      <div className={cn(variantClasses[variant], 'right-4', className)} {...props}>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={cn(buttonClasses, !canGoNext && 'opacity-50 cursor-not-allowed')}
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}

// ============================================================================
// CAROUSEL DOTS - Dot indicators
// ============================================================================
export function CarouselDots({
  total,
  current,
  onChange,
  variant = 'dots',
  className,
  ...props
}) {
  if (variant === 'numbers') {
    return (
      <div className={cn('flex justify-center items-center gap-2', className)} {...props}>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {current + 1}
        </span>
        <span className="text-sm text-gray-400">/</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {total}
        </span>
      </div>
    );
  }

  if (variant === 'line') {
    return (
      <div className={cn('flex justify-center gap-1', className)} {...props}>
        {Array.from({ length: total }).map((_, index) => (
          <button
            key={index}
            onClick={() => onChange?.(index)}
            className={cn(
              'h-1 rounded-full transition-all',
              index === current
                ? 'w-8 bg-blue-600'
                : 'w-4 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex justify-center gap-2', className)} {...props}>
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onChange?.(index)}
          className={cn(
            'w-2.5 h-2.5 rounded-full transition-colors',
            index === current
              ? 'bg-blue-600'
              : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
          )}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}

// ============================================================================
// IMAGE CAROUSEL - Image-focused carousel
// ============================================================================
export function ImageCarousel({
  images,
  aspectRatio = '16/9',
  objectFit = 'cover',
  showCaptions = false,
  className,
  ...props
}) {
  return (
    <Carousel className={className} {...props}>
      {images.map((image, index) => (
        <CarouselSlide key={index}>
          <div style={{ aspectRatio }} className="relative">
            <img
              src={image.src}
              alt={image.alt || ''}
              className={cn('w-full h-full rounded-lg', `object-${objectFit}`)}
            />
            {showCaptions && image.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                <p className="text-white text-sm">{image.caption}</p>
              </div>
            )}
          </div>
        </CarouselSlide>
      ))}
    </Carousel>
  );
}

// ============================================================================
// CARD CAROUSEL - Card carousel
// ============================================================================
export function CardCarousel({
  cards,
  slidesToShow = 3,
  gap = 24,
  className,
  ...props
}) {
  return (
    <Carousel
      slidesToShow={slidesToShow}
      gap={gap}
      showDots={false}
      className={className}
      {...props}
    >
      {cards.map((card, index) => (
        <CarouselSlide key={index}>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
            {card.image && (
              <img
                src={card.image}
                alt={card.title || ''}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              {card.title && (
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {card.title}
                </h3>
              )}
              {card.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {card.description}
                </p>
              )}
              {card.action && (
                <div className="mt-4">{card.action}</div>
              )}
            </div>
          </div>
        </CarouselSlide>
      ))}
    </Carousel>
  );
}

// ============================================================================
// TESTIMONIAL CAROUSEL - Testimonial slider
// ============================================================================
export function TestimonialCarousel({
  testimonials,
  autoplay = true,
  className,
  ...props
}) {
  return (
    <Carousel
      autoplay={autoplay}
      autoplayInterval={6000}
      showArrows={false}
      className={cn('max-w-3xl mx-auto', className)}
      {...props}
    >
      {testimonials.map((testimonial, index) => (
        <CarouselSlide key={index}>
          <div className="text-center px-8">
            <blockquote className="text-xl md:text-2xl text-gray-900 dark:text-white italic mb-6">
              "{testimonial.quote}"
            </blockquote>
            <div className="flex items-center justify-center gap-4">
              {testimonial.avatar && (
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {testimonial.author}
                </p>
                {testimonial.role && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CarouselSlide>
      ))}
    </Carousel>
  );
}

// ============================================================================
// HERO CAROUSEL - Full-width hero carousel
// ============================================================================
export function HeroCarousel({
  slides,
  height = '60vh',
  autoplay = true,
  overlay = true,
  overlayOpacity = 40,
  className,
  ...props
}) {
  return (
    <Carousel
      autoplay={autoplay}
      autoplayInterval={7000}
      className={cn('w-full', className)}
      {...props}
    >
      {slides.map((slide, index) => (
        <CarouselSlide key={index}>
          <div
            className="relative w-full"
            style={{ height }}
          >
            <img
              src={slide.image}
              alt={slide.title || ''}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {overlay && (
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: overlayOpacity / 100 }}
              />
            )}

            <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
              <div className="max-w-4xl">
                {slide.subtitle && (
                  <p className="text-blue-400 font-semibold mb-4">
                    {slide.subtitle}
                  </p>
                )}
                {slide.title && (
                  <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                    {slide.title}
                  </h2>
                )}
                {slide.description && (
                  <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                    {slide.description}
                  </p>
                )}
                {slide.action && (
                  <div>{slide.action}</div>
                )}
              </div>
            </div>
          </div>
        </CarouselSlide>
      ))}
    </Carousel>
  );
}

// ============================================================================
// THUMBNAIL CAROUSEL - Carousel with thumbnails
// ============================================================================
export function ThumbnailCarousel({
  images,
  aspectRatio = '16/9',
  thumbnailSize = 80,
  className,
  ...props
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className={className} {...props}>
      {/* Main image */}
      <div className="relative mb-4" style={{ aspectRatio }}>
        <img
          src={images[currentIndex]?.src}
          alt={images[currentIndex]?.alt || ''}
          className="w-full h-full object-cover rounded-lg"
        />

        {/* Navigation */}
        <CarouselNav
          onPrev={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
          onNext={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all',
              index === currentIndex
                ? 'border-blue-600'
                : 'border-transparent opacity-60 hover:opacity-100'
            )}
            style={{ width: thumbnailSize, height: thumbnailSize }}
          >
            <img
              src={image.src}
              alt={image.alt || ''}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// INFINITE CAROUSEL - Infinite scrolling carousel
// ============================================================================
export function InfiniteCarousel({
  children,
  speed = 30,
  direction = 'left',
  pauseOnHover = true,
  className,
  ...props
}) {
  const slides = React.Children.toArray(children);

  return (
    <div
      className={cn('overflow-hidden', className)}
      {...props}
    >
      <div
        className={cn(
          'flex gap-4',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
        style={{
          animation: `scroll-${direction} ${speed}s linear infinite`,
        }}
      >
        {/* Original slides */}
        {slides.map((slide, index) => (
          <div key={index} className="flex-shrink-0">
            {slide}
          </div>
        ))}
        {/* Duplicate for seamless loop */}
        {slides.map((slide, index) => (
          <div key={`dup-${index}`} className="flex-shrink-0">
            {slide}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// FADE CAROUSEL - Fade transition carousel
// ============================================================================
export function FadeCarousel({
  children,
  autoplay = true,
  autoplayInterval = 5000,
  showDots = true,
  className,
  ...props
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = React.Children.toArray(children);

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [autoplay, autoplayInterval, slides.length]);

  return (
    <div className={cn('relative', className)} {...props}>
      {slides.map((slide, index) => (
        <div
          key={index}
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          )}
        >
          {slide}
        </div>
      ))}

      {showDots && (
        <CarouselDots
          total={slides.length}
          current={currentIndex}
          onChange={setCurrentIndex}
          className="absolute bottom-4 left-0 right-0"
        />
      )}
    </div>
  );
}

export default Carousel;
