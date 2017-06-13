FROM mhart/alpine-node:8

# via https://hub.docker.com/r/rafakato/alpine-graphicsmagick/~/dockerfile/
ARG PKGNAME=graphicsmagick
ARG PKGVER=1.3.23
ARG PKGSOURCE=http://downloads.sourceforge.net/$PKGNAME/$PKGNAME/$PKGVER/GraphicsMagick-$PKGVER.tar.lz

# RUN apk add --update graphicsmagick --update-cache --repository http://dl-3.alpinelinux.org/alpine/edge/testing/ --allow-untrusted
#
# Installing graphicsmagick dependencies
RUN apk add --update g++ \
                     gcc \
                     make \
                     lzip \
                     wget \
                     libjpeg-turbo-dev \
                     libpng-dev \
                     libtool \
                     libgomp \
                     ca-certificates \
                     ghostscript-fonts \
                     freetype \
                     freetype-dev && \
    wget $PKGSOURCE && \
    lzip -d -c GraphicsMagick-$PKGVER.tar.lz | tar -xvf - && \
    cd GraphicsMagick-$PKGVER && \
    ./configure \
      --build=$CBUILD \
      --host=$CHOST \
      --prefix=/usr \
      --sysconfdir=/etc \
      --mandir=/usr/share/man \
      --infodir=/usr/share/info \
      --localstatedir=/var \
      --enable-shared \
      --disable-static \
      --with-modules \
      --with-threads \
      --with-gs-font-dir=/usr/share/fonts/Type1 \
      --with-quantum-depth=16 && \
    make && \
    make install && \
    cd / && \
    rm -rf GraphicsMagick-$PKGVER && \
    rm GraphicsMagick-$PKGVER.tar.lz && \
    apk del g++ \
            gcc \
            make \
            lzip \
            wget && \
    update-ca-certificates && \
    rm -rf /var/cache/apk/*

RUN mkdir /app
WORKDIR /app

COPY package.json /app
RUN yarn

COPY . /app

RUN yarn run build

CMD ["node", "/app/build/index.js"]
