#!/usr/bin/env bash
# Converts the original crawl assets into named WebP files under src/assets/img.
# Usage: tools/optimize-images.sh <dir-with-original-jpgs>
set -euo pipefail
A="${1:?source dir}"
conv(){ # src dest [maxwidth]
  if [ -n "${3:-}" ]; then cwebp -quiet -q 82 -resize "$3" 0 "$A/$1" -o "$2"; else cwebp -quiet -q 82 "$A/$1" -o "$2"; fi
}
for pair in vnltz6yaxrwjo3mbboch:smith-nephew gybn1khjpem3f3dircz6:karl-storz v0hmybqgosbb8fvxnnhd:richard-wolf pio8xlgeu5tiinqqrkoz:pentax ph75xjyn1t2nakprp4c2:olympus meu26e4zrccjkd0mbqzd:ethicon l846b0q9powp8nx1ydag:fujinon eghezsizvua6vgnxnlxv:arthrex omgpyhufxbpoqihgr8dc:arthrocare bscjit5kho46mhcfivkg:biomet xxisgjuw6vrwteotd1b5:sony sudbyf7t0fzcsi8eg0nf:nds nippuw1mlr64alr86lev:gyrus-acmi ffqqbm1wybt2m624e5jl:hall nmql4t4dk5wngmqdzgjp:microaire w1fnnn8j0ms1ihezdooy:aesculap pxtuzqfdjcxdnl5hsecf:valleylab mfot2czr58ekfpd7husf:zimmer qbrc5okl6flujxmsz18k:stryker; do conv "${pair%%:*}.jpg" "src/assets/img/brands/${pair##*:}.webp"; done
for pair in bbemidkkoolgjjxlpo6x:cameras-de-video aqwldm2ow2nbr7tfkkuk:monitores-de-video xppmlvn31afmmxj68drf:fonte-de-luz dmqyzlwgie9278fdm7ip:acessorios hcymvkcvi7yt00slxzlw:artrobomba x2oxezmyhkhyugstsgfs:instrumentos tuuo4icb9ac3cj09xvru:insufladores nnxwfpltpjha1syp8x8c:perfuradores gq0sknndved8genumqdp:serras hkrkle6lw2lsrozeirsh:carregadores; do conv "${pair%%:*}.jpg" "src/assets/img/categories/${pair##*:}.webp" 800; done
for pair in lul0antqcotnkch11svk:carregador-de-bateria-inteligente fg7ilnzxbqjn9u4qns8f:dyonics-bomba-access-25 v6gmr9c2x5y6121dtrwa:dyonics-camera-560p w4lg5mrcymqjth4mx0pp:dyonics-fonte-de-luz-500xl yyaceodgg0wykgsnv7iw:dyonics-insuflador-40-lpm wnzvlzwarkhoowfkow4d:endocouplers wbfhftlokz6zj86zjide:lampadas-p3300bf bounmcq2q4prrqsfin2r:nds-monitor-19-endovue qzedtn9we0ccgfqyw2yk:nds-monitor-26-radiance-g2 rnr1ngbhne1ja45alkap:stahl-access umaqdh6povegp4vfnoe0:stahl-acessorios-de-limpeza iyqbsgae2ufbkozhj5xl:stahl-cabo-de-fibra-optica m0z5p0s2pynpn26i34av:stahl-caixa-de-esterilizacao jatwtvu28tz5z6acazek:storz-camera-image1-hub iwxvbb5jldetlngamlfr:storz-fonte-de-luz-300w-xenon guehf89u3spv7t5z4e54:storz-insuflador-30-lpm rnuesvormynumdkzsdiw:storz-monitor-wideview-24 vxl0ppgtdoef5sbo1fe7:stryker-5-carregador-de-bateria lwor4bm7xyeeo8hgk73f:stryker-5-perfurador ajfdwgwpsjubbspesvud:stryker-5-perfurador-e-serra b4d5rhear9uznd3uwyty:stryker-5-serra whffwl6hn7cbn5qxzam7:stryker-6-perfurador ich1bvef7yvrqdpuv1g4:stryker-6-perfurador-e-serra p9mpn1tddnwkqyxchgln:stryker-6-serra sxmkuar9euypirw4rgdr:stryker-bomba-arthropump cfnwdcft4wbt1f9yr1ao:stryker-camera-1488hd hbzge6umxkd8khwbyplk:stryker-fonte-de-luz-l9000-led csf8rysdxm3u0j1ycmoj:stryker-insuflador-core-40-lpm r1ydytdkdkwkauoee9xc:stryker-monitor-wise; do conv "${pair%%:*}.jpg" "src/assets/img/products/${pair##*:}.webp" 1000; done
# Small variants for srcset (cards and mobile)
for f in src/assets/img/products/*.webp src/assets/img/categories/*.webp; do
  case "$f" in *-480.webp) continue;; esac
  cwebp -quiet -q 80 -resize 480 0 "$f" -o "${f%.webp}-480.webp"
done
conv phqfyifkmfoav103xle0.jpg src/assets/img/site/hero-servicos.webp 1600
conv phqfyifkmfoav103xle0.jpg src/assets/img/site/hero-servicos-960.webp 960
conv phqfyifkmfoav103xle0.jpg src/assets/img/site/hero-servicos-480.webp 480
cwebp -quiet -q 90 -resize 1200 0 "$A/phqfyifkmfoav103xle0.jpg" -o src/assets/img/site/og-image.webp
cp "$A/logo_site.png" src/assets/img/site/logo.png
