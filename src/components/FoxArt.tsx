import type { CSSProperties } from 'react';

/**
 * The fox artwork, inlined so its parts stay addressable.
 *
 * Drawn at 800x800. The pieces can be animated independently:
 *   #axi-tail   rotates about its root  (wag)
 *   #axi-eye-*  scaleY about their centre (blink)
 *   #axi-pupil-* take a transform        (cursor tracking)
 *   #axi-spark  twinkles
 *
 * Inlining matters: a background-image would render the same but nothing
 * inside it could be moved, and Axi's whole personality is the eyes.
 */
export function FoxArt({ pupilStyle }: { pupilStyle: CSSProperties }) {
  return (
    <svg
      className="fox-art"
      viewBox="0 0 800 800"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
    <linearGradient id="axi-fox-fur" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FF9A45"/>
      <stop offset="1" stopColor="#E9682C"/>
    </linearGradient>
    <linearGradient id="axi-fox-tail-fur" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#FFA451"/>
      <stop offset="1" stopColor="#E9682C"/>
    </linearGradient>
  </defs>

      <g id="axi-tail">
        <path d="M506 555 C600 500 680 536 685 610 C690 671 626 706 567 670
           C535 650 522 616 487 608 Z"
        fill="url(#axi-fox-tail-fur)" stroke="#24324A" strokeWidth="15" strokeLinejoin="round"/>
        <path d="M630 648 C652 625 651 600 635 581 C661 589 676 610 667 634
           C660 652 643 661 630 648 Z"
        fill="#FFF0D8" stroke="#24324A" strokeWidth="12" strokeLinejoin="round"/>
      </g>

      <g id="axi-body">
        <path d="M282 478 C305 429 354 410 409 420 C475 431 515 478 517 548
           C519 607 476 650 405 654 L335 654 C281 649 251 616 255 563
           C257 528 266 500 282 478 Z"
        fill="url(#axi-fox-fur)" stroke="#24324A" strokeWidth="16" strokeLinejoin="round"/>
        <path d="M344 468 C365 450 400 451 422 470 C450 495 452 547 431 594
           C418 620 395 632 372 620 C340 603 324 563 329 522
           C331 499 335 481 344 468 Z"
        fill="#FFF0D8" stroke="#24324A" strokeWidth="11" strokeLinejoin="round"/>
        <path d="M305 632 C291 641 288 660 301 669 C317 679 347 674 358 663
           L358 649 Z" fill="#E9682C" stroke="#24324A" strokeWidth="13" strokeLinejoin="round"/>
        <path d="M407 644 C396 655 399 672 414 677 C431 682 454 674 460 661
           L449 645 Z" fill="#E9682C" stroke="#24324A" strokeWidth="13" strokeLinejoin="round"/>
      </g>

      <g id="axi-head">
        <path d="M251 282 L236 128 Q234 111 251 124 L352 199
           C382 188 415 188 447 200 L545 127 Q562 113 560 135
           L545 287 C570 319 578 362 566 403
           C550 462 492 495 400 495 C308 495 250 460 234 403
           C222 362 229 316 251 282 Z"
        fill="url(#axi-fox-fur)" stroke="#24324A" strokeWidth="17" strokeLinejoin="round"/>
        <g id="axi-ear-inner">
          <path d="M263 159 L274 264 L326 218 Z" fill="#F7B0A0" stroke="#24324A" strokeWidth="10" strokeLinejoin="round"/>
          <path d="M531 161 L522 264 L473 220 Z" fill="#F7B0A0" stroke="#24324A" strokeWidth="10" strokeLinejoin="round"/>
        </g>
        <path d="M270 326 C286 289 323 272 359 284 C376 290 389 306 400 323
           C412 305 429 290 448 284 C484 272 519 291 532 326
           C545 365 528 407 495 426 C469 442 437 430 400 400
           C364 430 332 442 305 426 C273 407 257 365 270 326 Z"
        fill="#FFF0D8" stroke="#24324A" strokeWidth="12" strokeLinejoin="round"/>

        <g id="axi-eye-left">
          <ellipse cx="340" cy="332" rx="25" ry="32" fill="#FFFFFF" stroke="#24324A" strokeWidth="9"/>
          <g id="axi-pupil-left" style={pupilStyle}>
            <ellipse cx="347" cy="337" rx="12" ry="19" fill="#24324A"/>
            <circle cx="351" cy="328" r="5" fill="#FFFFFF"/>
          </g>
        </g>

        <g id="axi-eye-right">
          <ellipse cx="462" cy="332" rx="25" ry="32" fill="#FFFFFF" stroke="#24324A" strokeWidth="9"/>
          <g id="axi-pupil-right" style={pupilStyle}>
            <ellipse cx="455" cy="337" rx="12" ry="19" fill="#24324A"/>
            <circle cx="459" cy="328" r="5" fill="#FFFFFF"/>
          </g>
        </g>

        <g id="axi-muzzle">
          <path d="M355 374 C368 355 388 351 400 359 C414 350 435 356 447 374
           C440 402 421 419 400 419 C379 419 361 402 355 374 Z"
        fill="#FFFFFF" stroke="#24324A" strokeWidth="10" strokeLinejoin="round"/>
          <path d="M387 374 Q400 364 413 374 Q410 389 400 389 Q390 389 387 374 Z"
        fill="#24324A"/>
          <path d="M400 389 Q399 405 383 407 M400 389 Q401 405 417 407"
        fill="none" stroke="#24324A" strokeWidth="7" strokeLinecap="round"/>
        </g>
      </g>

      <g id="axi-spark">
        <path d="M590 287 L597 307 L617 314 L597 321 L590 341 L583 321 L563 314 L583 307 Z"
        fill="#F7C84B" stroke="#24324A" strokeWidth="7" strokeLinejoin="round"/>
      </g>
    </svg>
  );
}
