var __funcaptchaSolvedCallback;var parameters={};if(document.currentScript&&document.currentScript.dataset&&document.currentScript.dataset["parameters"]){try{parameters=JSON.parse(document.currentScript.dataset["parameters"])}catch(e){}}if(parameters.originalFuncaptchaApiUrl&&parameters.currentFuncaptchaApiUrl&&parameters.originalFuncaptchaApiUrl!=parameters.currentFuncaptchaApiUrl){var allTheScripts=document.getElementsByTagName("script");for(var i in allTheScripts){if(allTheScripts[i].src==parameters.originalFuncaptchaApiUrl){allTheScripts[i].src=parameters.currentFuncaptchaApiUrl;break}}}else{}var onloadMethodName=parameters.currentOnloadMethodName;if(onloadMethodName){var oldLoadFunCaptcha;if(typeof window[onloadMethodName]==="function"){oldLoadFunCaptcha=window[onloadMethodName]}window[onloadMethodName]=function(){var oldFunCaptcha=FunCaptcha;FunCaptcha=function(parameters){if(parameters&&typeof parameters.callback=="function"){var oldFuncaptchaSolvedCallback=parameters.callback;parameters.callback=function(){oldFuncaptchaSolvedCallback.apply(this,arguments)};__funcaptchaSolvedCallback=parameters.callback}return oldFunCaptcha.apply(this,arguments)};if(typeof oldLoadFunCaptcha==="function"){oldLoadFunCaptcha.apply(this,arguments)}}}