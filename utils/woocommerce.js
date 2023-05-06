import WooCommerceAPI from 'woocommerce-api';

export const wooCommerce = new WooCommerceAPI({
  url: 'https://www.fairytailored.dk/',
  consumerKey: 'ck_fc132283cd716014e80671354f8b3f31a9d4b0ba',
  consumerSecret: 'cs_a3dba986a6b070cb396ce18bbe24eb366b435431',
  wpAPI: true,
  version: 'wc/v3'
});

// 'http://localhost/wordpress/'
// 'ck_060d51ce36799d4f236153e97874e7ef14bb1279'
// 'cs_ee287f9813e004f5951d00f513c63bb31e9a6547'