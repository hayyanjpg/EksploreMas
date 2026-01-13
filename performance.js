import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

//  definisi matrik
const rateHome = new Rate('sukses_home');
const rateNongkrong = new Rate('sukses_nongkrong');
const rateKuliner = new Rate('sukses_kuliner');
const rateAlam = new Rate('sukses_alam');
const ratePendidikan = new Rate('sukses_pendidikan');
const rateNews = new Rate('sukses_news');

export const options = {
  stages: [
    { duration: '10s', target: 10 }, 
    { duration: '30s', target: 50 }, // Kamu menaikkan ke 50 user, bagus!
    { duration: '10s', target: 0 }, 
  ],
  thresholds: {
    'sukses_home': ['rate>0.95'],
    'sukses_nongkrong': ['rate>0.90'],
    'sukses_news': ['rate>0.90'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL_WEB = 'https://eksplore-mas.vercel.app';
const BASE_URL_API = 'https://hayyann-exploremas.hf.space'; 

export default function () {

  group('Akses Frontend', function () {
    const res = http.get(`${BASE_URL_WEB}/`, { tags: { my_tag: 'Frontend' } });
    rateHome.add(res.status === 200);
    check(res, { 'Web Status 200': (r) => r.status === 200 });
  });

  group('Akses API Backend', function () {
    
    // BE API 
    const res1 = http.get(`${BASE_URL_API}/tempat_nongkrong`, { tags: { name: 'Nongkrong' } });
    const res2 = http.get(`${BASE_URL_API}/get_kuliner`, { tags: { name: 'Kuliner' } });
    const res3 = http.get(`${BASE_URL_API}/wisata_alam`, { tags: { name: 'WisataAlam' } });
    const res4 = http.get(`${BASE_URL_API}/wisata_pendidikan`, { tags: { name: 'WisataPend' } });
    const res5 = http.get(`${BASE_URL_API}/api/news`, { tags: { name: 'News' } });
    //kalau error muncul di terminla
    if (res5.status !== 200) {
        
        console.error(`ERROR NEWS! Status: ${res5.status}. Msg: ${res5.body.substring(0, 100)}`);
    }

    // mencatat metrik
    rateNongkrong.add(res1.status === 200);
    rateKuliner.add(res2.status === 200);
    rateAlam.add(res3.status === 200);
    ratePendidikan.add(res4.status === 200);
    rateNews.add(res5.status === 200);

    // ngecek validasi
    check(res1, { 'Nongkrong OK': (r) => r.status === 200 });
    check(res2, { 'Kuliner OK': (r) => r.status === 200 });
    check(res3, { 'Alam OK': (r) => r.status === 200 });
    check(res4, { 'Pendidikan OK': (r) => r.status === 200 });
    check(res5, { 'News OK': (r) => r.status === 200 });
  });

  sleep(1);
}