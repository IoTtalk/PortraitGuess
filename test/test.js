const {Builder, By, Key, until} = require('selenium-webdriver');

	let driver =  new Builder().forBrowser('firefox').build();
	driver.get('http://140.113.169.226:7777/Sk_jlVRuM');
  	let playButton = driver.findElement({id:'playButton'});
    let optionBtns = driver.findElements(By.className("optionBtn"));
    let pressPlay = function(){
  		playButton.click();
  		driver.wait(until.elementIsVisible(optionBtns), 500);
  		pressOption();
	};
	let pressOption = function(){
		let randomAnswer = Math.floor((Math.random()*5));
	    optionBtns.then(function(elem){
	    	elem[randomAnswer].click();
	    }).catch(function(e){
	    	console.log(e)
	    });
		var playButtonVisiable = driver.findElement({id:'playButton'}).isDisplayed();
		playButtonVisiable.then(function(result){
			if(result)
  				setTimeout(pressPlay, 1500);
  			else
  				pressOption();
		});
	};
	setTimeout(pressPlay, 3000);