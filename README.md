<img src="https://github.com/0mnr0/ownify/blob/main/files/readme_title.png?raw=true">

# Ownify 


<h3> Что это такое? </h2>
<h4> Ownify - настраиваемое Proxy соединение (тестировался только HTTP). На момент выпуска расширения уже имеет функционал белого списка сайтов, скрытия утечки WebRTC, подмены Chrome User-Agent и авто-обновление белого списка</h4>
<br><br>

***************

<details><summary>Работа с Ownify</summary>
  <h2> Откуда установить Ownify? </h2><br>
  Пока что расширение недоступно в Chrome WebStore, так как до конца августа оно будет тестироваться. Пока что можно только скачать исходники, разархивировать и "загрузить распакованное расширение" напрямую в браузер
  <br><br>
  
***************
  <h2> Как подключиться к Ownify? </h2><br>
  При открытии расширения вас попросят ввести конфигурацию. Вы можете получить её от человека или создать её самому если у вас есть proxy сервер <br><br>
  
***************
  <h2> Обзодит ли это расширение DPI фильтры ? </h2><br>
  Лично у меня - обходит. Но этом ожет зависеть от вашего провайдера, расположения сервера и других тысяч критериев <br><br>
  
***************
  <h2> Не работает соединение (не проходит траффик / ошибка прокси) </h2><br>
  Попробуйте протестировать curl с нужными параметрами. Если всё ещё не работает - напишите мне в Telegram: t.me/dsvl0 <br><br>
</details>


<h2> Как создать конфиг Ownify? </h2><br>
<span>Ownify использует следующий синтаксис на вход:</span> 

```json
{"host": "xx.xx.xx.xxx", "scheme": "http", "PCP": 443, "PCN": "QspyzVtfsobnf", "PCA": "ZpvsQbttxpse"}
```

ГДЕ:
  - host -> IP Сервера
  - scheme -> HTTP (Возможно и SOCKS5, я не тестировал)
  - PCP -> Proxy Connection Port
  - PCN -> Proxy Connection Username (If needed) (! ROT1 Encoded !)
  - PCA -> Proxy Connection Passwrod (If needed) (! ROT1 Encoded !)
  
Функция кодирования в ROT1:
```js
function rot1Encode(str) {
  return [...str].map(c =>
    c >= 'A' && c <= 'Y' || c >= 'a' && c <= 'y' ? String.fromCharCode(c.charCodeAt(0) + 1) :
    c === 'Z' ? 'A' : c === 'z' ? 'a' : c
  ).join('');
}
```
