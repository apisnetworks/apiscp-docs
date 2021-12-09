---
title: "PageSpeed support"
date: "2015-04-27"
---

## Overview

PageSpeed ([mod\_pagespeed](https://developers.google.com/speed/pagespeed/module)) optimizes your site and makes content load more quickly. PageSpeed applies a variety of filters including minifying scripts, inlining CSS, and automatically deferring JavaScript to avoid blocking DOM rendering. Users can browse your site with less latency, and in turn, improve visitor engagement.

## Availability

PageSpeed is available on all [v5+ platforms](https://kb.apnscp.com/platform/determining-platform-version/). PageSpeed is enabled by default.

## Filter usage

PageSpeed is built as modular filters. These filters, in turn, may be added and removed to a web site resulting in a variety of optimizations. Filters may be added or removed in a [.htaccess file](https://kb.apnscp.com/guides/htaccess-guide/).  By default, all filters listed in  `CoreFilters` (refer to Filter list) are enabled.

1. Create a file named `.htaccess` in your [document root](https://kb.apnscp.com/web-content/where-is-site-content-served-from/) if it does not already exist
    - **To add filters: ** `ModPagespeedEnableFilters filtera,filterb`
    - **To remove filters:** `ModPagespeedDisableFilters filtera,filterb`
2. Once committed, these filters specified will be added or removed from `CoreFilters`

### Filter list

Note: In the heading, "CF" is CoreFilters and OFB is "OptimizeForBandwidth".

Filter Name

In CF

In OFB

Brief Description

`[add_head](https://developers.google.com/speed/pagespeed/module/filter-head-add)`

Yes

No

Adds a `<head>` element to the document if not already present.

`[combine_heads](https://developers.google.com/speed/pagespeed/module/filter-head-combine)`

No

No

Combines multiple `<head>` elements found in document into one.

`[inline_import_to_link](https://developers.google.com/speed/pagespeed/module/filter-css-inline-import)`

Yes

No

Inlines <style> tags comprising only CSS @imports by converting them to equivalent <link> tags.

`[outline_css](https://developers.google.com/speed/pagespeed/module/filter-css-outline)`

No

No

Externalize large blocks of CSS into a cacheable file.

`[outline_javascript](https://developers.google.com/speed/pagespeed/module/filter-js-outline)`

No

No

Externalize large blocks of JS into a cacheable file.

`[move_css_above_scripts](https://developers.google.com/speed/pagespeed/module/filter-css-above-scripts)`

No

No

Moves CSS elements above `<script>` tags.

`[move_css_to_head](https://developers.google.com/speed/pagespeed/module/filter-css-to-head)`

No

No

Moves CSS elements into the `<head>`.

`[combine_css](https://developers.google.com/speed/pagespeed/module/filter-css-combine)`

Yes

No

Combines multiple CSS elements into one.

`[rewrite_css](https://developers.google.com/speed/pagespeed/module/filter-css-rewrite)`

Yes

Yes

Rewrites CSS files to remove excess whitespace and comments, and, if enabled, rewrite or cache-extend images referenced in CSS files. In OptimizeForBandwidth mode, the minification occurs in-place without changing URLs.

`[fallback_rewrite_css_urls](https://developers.google.com/speed/pagespeed/module/filter-css-rewrite)`

Yes

No

Rewrites resources referenced in any CSS file that cannot otherwise be parsed and minified.

`[rewrite_style_attributes](https://developers.google.com/speed/pagespeed/module/filter-rewrite-style-attributes)`

No

No

Rewrite the CSS in style attributes by applying the configured rewrite\_css filter to it.

`[rewrite_style_attributes_with_url](https://developers.google.com/speed/pagespeed/module/filter-rewrite-style-attributes)`

Yes

No

Rewrite the CSS in style attributes if it contains the text 'url(' by applying the configured rewrite\_css filter to it

`[flatten_css_imports](https://developers.google.com/speed/pagespeed/module/filter-flatten-css-imports)`

Yes

No

Inline CSS by flattening all @import rules.

`[prioritize_critical_css](https://developers.google.com/speed/pagespeed/module/filter-prioritize-critical-css)`

No

No

Replace CSS tags with inline versions that include only the CSS used by the page.

`[make_google_analytics_async](https://developers.google.com/speed/pagespeed/module/filter-make-google-analytics-async)`

No

No

Convert synchronous use of Google Analytics API to asynchronous

`[rewrite_javascript](https://developers.google.com/speed/pagespeed/module/filter-js-minify)`

Yes

Yes

Rewrites JavaScript files to remove excess whitespace and comments. In OptimizeForBandwidth mode, the minification occurs in-place without changing URLs.

`[rewrite_javascript_external](https://developers.google.com/speed/pagespeed/module/filter-js-minify)`

Yes

Yes

Implied by rewrite\_javascript. Rewrites JavaScript external files to remove excess whitespace and comments. In OptimizeForBandwidth mode, the minification occurs in-place without changing URLs.

`[rewrite_javascript_inline](https://developers.google.com/speed/pagespeed/module/filter-js-minify)`

Yes

Yes

Implied by rewrite\_javascript. Rewrites inline JavaScript blocks to remove excess whitespace and comments.

`[include_js_source_maps](https://developers.google.com/speed/pagespeed/module/filter-source-maps-include)`

No

No

Adds source maps to rewritten JavaScript files.

`[combine_javascript](https://developers.google.com/speed/pagespeed/module/filter-js-combine)`

Yes

No

Combines multiple script elements into one.

`[canonicalize_javascript_libraries](https://developers.google.com/speed/pagespeed/module/filter-canonicalize-js)`

No

No

Redirects JavaScript libraries to a JavaScript hosting service.

`[inline_css](https://developers.google.com/speed/pagespeed/module/filter-css-inline)`

Yes

No

Inlines small CSS files into the HTML document.

`[inline_google_font_css](https://developers.google.com/speed/pagespeed/module/filter-css-inline-google-fonts)`

No

No

Inlines small CSS files used by fonts.googleapis.com into the HTML document.

`[inline_javascript](https://developers.google.com/speed/pagespeed/module/filter-js-inline)`

Yes

No

Inlines small JS files into the HTML document.

`[local_storage_cache](https://developers.google.com/speed/pagespeed/module/filter-local-storage-cache)`

No

No

Cache inlined resources in HTML5 local storage.

`[insert_ga](https://developers.google.com/speed/pagespeed/module/filter-insert-ga)`

No

No

Adds the Google Analytics snippet to each HTML page.

`[rewrite_images](https://developers.google.com/speed/pagespeed/module/filter-image-optimize)`

Yes

Yes

Optimizes images, re-encoding them, removing excess pixels, and inlining small images. In OptimizeForBandwidth mode, the minification occurs in-place without changing URLs.

`[convert_jpeg_to_progressive](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#progressive)`

Yes

Yes

Converts larger jpegs to progressive format. Implied by recompress images.

`[convert_png_to_jpeg](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#png_to_jpeg)`

Yes

Yes

Converts gif and png images into jpegs if they appear to be less sensitive to compression artifacts and lack alpha transparency. Implied by recompress images.

`[convert_jpeg_to_webp](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#convert_jpeg_to_webp)`

Yes

Yes

Producess lossy webp rather than jpeg images for browsers that support webp. Implied by recompress images.

`[convert_to_webp_lossless](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#convert_to_webp_lossless)`

No

No

Replaces gif and png images with webp images on browsers that support the format.

`[insert_image_dimensions](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#dimensions)`

No

No

Adds `width` and `height` attributes to `<img>` tags that lack them.

`[inline_images](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#inline_images)`

Yes

No

Implied by rewrite\_images. Replaces small images by`data:` urls.

`[recompress_images](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#recompress_images)`

Yes

Yes

Implied by rewrite\_images. Recompresses images, removing excess metadata and transforming gifs into pngs.

`[recompress_jpeg](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#recompress_jpeg)`

Yes

Yes

Implied by recompress\_images. Recompresses jpegs, removing excess metadata.

`[recompress_png](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#recompress_png)`

Yes

Yes

Implied by recompress\_images. Recompresses pngs, removing excess metadata.

`[recompress_webp](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#recompress_webp)`

Yes

Yes

Implied by recompress\_images. Recompresses webps, removing excess metadata.

`[convert_gif_to_png](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#convert_gif_to_png)`

Yes

Yes

Implied by recompress\_images. Optimizes gifs to pngs.

`[strip_image_color_profile](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#strip_image_color_profile)`

Yes

Yes

Implied by recompress\_images. Strips color profile info from images.

`[strip_image_meta_data](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#strip_image_meta_data)`

Yes

Yes

Implied by recompress\_images. Strips EXIF meta data from images.

`[jpeg_sampling](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#jpeg_sampling)`

Yes

Yes

Implied by recompress\_images. Reduces the color sampling of jpeg images to 4:2:0.

`[resize_images](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#resize_images)`

Yes

No

Implied by rewrite\_images. Resizes images when the corresponding `<img>` tag specifies a smaller `width`and `height`.

`[resize_rendered_image_dimensions](https://developers.google.com/speed/pagespeed/module/filter-image-optimize#resize_rendered_image_dimensions)`

Yes

No

Implied by rewrite\_images. Resizes an image when the rendered dimensions of the image are smaller than the actual image.

`[inline_preview_images](https://developers.google.com/speed/pagespeed/module/filter-inline-preview-images)`

No

No

Uses inlined low-quality images as placeholders which will be replaced with original images once the web page is loaded.

`[resize_mobile_images](https://developers.google.com/speed/pagespeed/module/filter-inline-preview-images#resize_mobile_images)`

No

No

Works just like `inline_preview_images`, but uses smaller placeholder images and only serves them to mobile browsers.

`[remove_comments](https://developers.google.com/speed/pagespeed/module/filter-comment-remove)`

No

No

Removes comments in HTML files (but not in inline JavaScript or CSS).

`[collapse_whitespace](https://developers.google.com/speed/pagespeed/module/filter-whitespace-collapse)`

No

No

Removes excess whitespace in HTML files (avoiding`<pre>`, `<script>`, `<style>`, and `<textarea>`).

`[elide_attributes](https://developers.google.com/speed/pagespeed/module/filter-attribute-elide)`

No

No

Removes attributes which are not significant according to the HTML spec.

`[extend_cache](https://developers.google.com/speed/pagespeed/module/filter-cache-extend)`

Yes

No

Extends cache lifetime of CSS, JS, and image resources that have not otherwise been optimized, by signing URLs with a content hash.

`[extend_cache_css](https://developers.google.com/speed/pagespeed/module/filter-cache-extend)`

Yes

No

Implied by extend\_cache. Extends cache lifetime of otherwise unoptimized CSS resources by signing URLs with a content hash.

`[extend_cache_images](https://developers.google.com/speed/pagespeed/module/filter-cache-extend)`

Yes

No

Implied by extend\_cache. Extends cache lifetime of otherwise unoptimized images by signing URLs with a content hash.

`[extend_cache_scripts](https://developers.google.com/speed/pagespeed/module/filter-cache-extend)`

Yes

No

Implied by extend\_cache. Extends cache lifetime of otherwise unoptimized scripts by signing URLs with a content hash.

`[extend_cache_pdfs](https://developers.google.com/speed/pagespeed/module/filter-cache-extend-pdfs)`

No

No

Extends cache lifetime of PDFs by signing URLs with a content hash.

`[sprite_images](https://developers.google.com/speed/pagespeed/module/filter-image-sprite)`

No

No

Combine background images in CSS files into one sprite.

`[rewrite_domains](https://developers.google.com/speed/pagespeed/module/filter-domain-rewrite)`

No

No

Rewrites the domains of resources not otherwise touched by PageSpeed, based on `MapRewriteDomain`and `ShardDomain` settings in the config file.

`[trim_urls](https://developers.google.com/speed/pagespeed/module/filter-trim-urls)`

No

No

Shortens URLs by making them relative to the base URL.

`[pedantic](https://developers.google.com/speed/pagespeed/module/filter-pedantic)`

No

No

Add default types for <script> and <style> tags if the type attribute is not present and the page is not HTML5. The purpose of this filter is to help ensure that PageSpeed does not break HTML4 validation.

`[remove_quotes](https://developers.google.com/speed/pagespeed/module/filter-quote-remove)`

No

No

Removes quotes around HTML attributes that are not lexically required.

`[add_instrumentation](https://developers.google.com/speed/pagespeed/module/filter-instrumentation-add)`

No

No

Adds JavaScript to page to measure latency and send back to the server.

`[convert_meta_tags](https://developers.google.com/speed/pagespeed/module/filter-convert-meta-tags)`

Yes

No

Adds a response header for each `meta` tag with an`http-equiv` attribute.

`[defer_javascript](https://developers.google.com/speed/pagespeed/module/filter-js-defer)`

No

No

Defers the execution of JavaScript in HTML until page load complete.

`[dedup_inlined_images](https://developers.google.com/speed/pagespeed/module/filter-dedup-inlined-images)`

No

No

Replaces repeated inlined images with JavaScript that loads the image from the first occurence of the image.

`[lazyload_images](https://developers.google.com/speed/pagespeed/module/filter-lazyload-images)`

No

No

Loads images when they become visible in the client viewport.

`[insert_dns_prefetch](https://developers.google.com/speed/pagespeed/module/filter-insert-dns-prefetch)`

No

No

Inserts `<link rel="dns-prefetch" href="//www.example.com">` tags to reduce DNS resolution time.

`[in_place_optimize_for_browser](https://developers.google.com/speed/pagespeed/module/system#in_place_optimize_for_browser)`

No

Yes

Perform browser-dependent [in-place resource optimizations](https://developers.google.com/speed/pagespeed/module/system#ipro).

 

## See also

- [PageSpeed: Configuring filters](https://developers.google.com/speed/pagespeed/module/config_filters)
- [PageSpeed: Filters](https://developers.google.com/speed/pagespeed/module/filters)
