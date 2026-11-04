'use strict';

// Set a personal key here for automatic loading without the connection form.
// A browser-only app exposes its key in requests. Do not embed a shared secret.
const API_KEY = '';
const KEY_STORAGE = 'jeju-weather-api-key';
const $ = (id) => document.getElementById(id);
let sessionKey = '';
try { sessionKey = sessionStorage.getItem(KEY_STORAGE) || ''; } catch { /* Storage may be disabled. */ }
let activeKey = API_KEY || sessionKey;

const errors = {
  1002: 'API 키를 입력해주세요.',
  1003: '날씨 조회 위치가 지정되지 않았습니다.',
  1006: '제주 위치를 찾을 수 없습니다.',
  2006: 'API 키가 올바르지 않습니다. 연결 설정을 확인해주세요.',
  2007: 'API 요청 한도를 초과했습니다. 나중에 다시 시도해주세요.',
  2008: '사용이 중지된 API 키입니다. 다른 키를 입력해주세요.',
  2009: '현재 날씨 조회 권한이 없는 API 키입니다.'
};

async function loadWeather() {
  if (!activeKey) {
    $('status').textContent = '아래에 API 키를 입력하면 현재 날씨를 불러옵니다.';
    $('settings').open = true;
    return;
  }
  $('refresh').disabled = true;
  $('key-form').querySelector('button').disabled = true;
  document.querySelector('.weather-card').setAttribute('aria-busy', 'true');
  $('status').classList.remove('error');
  $('status').textContent = '제주의 현재 날씨를 불러오는 중입니다…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const url = new URL('https://api.weatherapi.com/v1/current.json');
    url.search = new URLSearchParams({ key: activeKey, q: '33.4996,126.5312', lang: 'ko', aqi: 'no' }).toString();
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(errors[data.error?.code] || '날씨 서비스에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
    }
    const current = data.current;
    if (!current || !Number.isFinite(current.temp_c) || !Number.isFinite(current.humidity) || !current.condition?.text || !current.last_updated) {
      throw new Error('날씨 데이터가 올바르지 않습니다. 다시 시도해주세요.');
    }
    $('temperature').textContent = current.temp_c.toLocaleString('ko-KR', { maximumFractionDigits: 1 });
    $('humidity').textContent = current.humidity;
    $('condition').textContent = current.condition.text;
    // WeatherAPI returns the location's local time; display it directly as KST.
    $('updated').textContent = current.last_updated;
    const icon = $('condition-icon');
    const iconUrl = new URL(current.condition.icon || '', 'https://cdn.weatherapi.com');
    icon.hidden = iconUrl.hostname !== 'cdn.weatherapi.com' || !current.condition.icon;
    if (!icon.hidden) { icon.src = iconUrl.href; }
    icon.onerror = () => { icon.hidden = true; };
    $('badge').textContent = '현재 날씨';
    $('badge').classList.add('live');
    $('status').textContent = '제주의 날씨를 불러왔어요.';
    $('settings').open = false;
  } catch (error) {
    $('status').classList.add('error');
    $('status').textContent = error.name === 'AbortError'
      ? '응답 시간이 초과됐습니다. 다시 시도해주세요.'
      : error instanceof TypeError
        ? '네트워크 연결을 확인한 뒤 다시 시도해주세요.'
        : error.message;
    $('badge').textContent = '조회 실패';
    $('badge').classList.remove('live');
    if ($('temperature').textContent !== '—') {
      $('status').textContent += ' 화면에는 이전 조회 결과가 표시됩니다.';
    }
  } finally {
    clearTimeout(timeout);
    $('refresh').disabled = false;
    $('key-form').querySelector('button').disabled = false;
    document.querySelector('.weather-card').setAttribute('aria-busy', 'false');
  }
}

$('key-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const key = $('api-key').value.trim();
  if (!key) { $('api-key').focus(); return; }
  activeKey = key;
  try { sessionStorage.setItem(KEY_STORAGE, key); } catch { /* Continue in memory. */ }
  $('api-key').value = '';
  loadWeather();
});
$('refresh').addEventListener('click', loadWeather);
$('settings').open = !activeKey;
loadWeather();
