<img src="https://github.com/0mnr0/ownify/blob/main/files/readme_title.png?raw=true">
<div align="center">
  <p align="center">
  <a href="https://chromewebstore.google.com/detail/ownify/aiipddepmffihjeoaailegfackjihajd">
    <img src="https://github.com/0mnr0/ownify/blob/main/gitFiles/GetFromPlayStore.png?raw=true" width="400">
  </a>
</p>

</div>
<br>

# Ownify 


<h3> What is it? </h2>
<h4> Ownify is a configurable Proxy connection (only HTTP was tested). At the time of the extension's release, it already has the functionality of whitelisting sites, hiding WebRTC leaks, spoofing Chrome User-Agent, and auto-updating the whitelist.</h4>
<br><br>

***************

<details><summary>Working with Ownify</summary>
  <h2> Where do I install Ownify from? </h2><br>
  The installation of Ownify is available on Chromium browsers. If there is a stir, I will make a version for FireFox :).
  https://chromewebstore.google.com/detail/ownify/aiipddepmffihjeoaailegfackjihajd
  <br><br>
  
***************
  <h2> Does this extension bypass DPI filters? </h2><br>
  Personally, I'm getting around it. But it may depend on your provider and a bunch of other criteria <br><br>
  
***************
  <h2> The connection is not working (traffic is not getting through / proxy error) </h2><br>
  Try to test curl with the required parameters. If everything is still not working, write to me in Telegram: t.me/dsvl0 <br><br>
</details>


<h2> How do I create the Ownify config? </h2><br>
<span>Ownify uses the following syntax for input:</span> 

```json
{"host": "xx.xx.xx.xxx", "scheme": "http", "PCP": 443, "PCN": "QspyzVtfsobnf", "PCA": "ZpvsQbttxpse"}
```

ГДЕ:
  - host -> IP Address
  - scheme -> HTTP (Possibly SOCKS5, I haven't tested it)
  - PCP -> Proxy Connection Port
  - PCN -> Proxy Connection Username (If needed) (! ROT1 Encoded !)
  - PCA -> Proxy Connection Passwrod (If needed) (! ROT1 Encoded !)
  
The encoding function in ROT1 (JavaScript):
```js
function rot1Encode(str) {
  return [...str].map(c =>
    c >= 'A' && c <= 'Y' || c >= 'a' && c <= 'y' ? String.fromCharCode(c.charCodeAt(0) + 1) :
    c === 'Z' ? 'A' : c === 'z' ? 'a' : c
  ).join('');
}
```
