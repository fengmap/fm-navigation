/**
 * [navi 导航类]
 * @return {[type]} [description]
 */
define('voice', ['baidutts'], function (tts) {
    // 初始化变量
    var audio = null;
    var accesstoken = '';

    var voiceAjaxUrl = 'https://test6.fengmap.com/txv/fengmapWxIbeacons/accesstoken';	//外网

    $.ajax({
        url: voiceAjaxUrl,
        data: {
            // 'grant_type': 'client_credentials',
            'appKey': '1wzdeEffV3Hi3SpwbIiR2dvn',
            'appSecret': 'RZ1seHpVqpi2xwkCBVpovmMb7ZnYLVZE'
        },
        type: "GET",
        success: function (data) {
            accesstoken = data.accesstoken;
            // console.log("data.data: " + data.data);
        },
        error: function (error) {
            // console.log(error.statusText);
        }
    });

    // 播放按钮
    function play(message) {
        // 调用语音合成接口
        // 参数含义请参考 https://ai.baidu.com/docs#/TTS-API/41ac79a6
        audio = btts({
            tex: message,
            tok: accesstoken,
            spd: 5,
            pit: 5,
            vol: 15,
            per: 0
        }, {
            volume: 0.3,
            autoDestory: true,
            timeout: 10000,
            hidden: true,
            onInit: function (htmlAudioElement) {
                // console.log('audio调用语音合成接口onInit');
            },
            onSuccess: function (htmlAudioElement) {
                audio = htmlAudioElement;
                // console.log('audio调用语音合成接口onSuccess');
                if (audio === null) {
                    // console.log('合成失败');
                } else {
                    console.log(audio.src);
                    audio.play();
                    // console.log('语音播放完成：' + message);
                }
            },
            onError: function (message) {
                // console.log('audio调用语音合成接口onError' + message);
            },
            onTimeout: function () {
                // console.log('audio调用语音合成接口onTimeout');
            }
        });
    }

    // 暂停按钮
    function pause() {
        if (audio != null) {
            /*解决ios导航没有声音问题*/
            if (fmp.globalData.deviceType === 'ios') {
                window.speechSynthesis.cancel();
            } else {
                audio.pause();
            }
        }
    }

    // 取消按钮
    function cancel() {
        /*解决ios导航没有声音问题*/
        if (fmp.globalData.deviceType === 'ios') {
            window.speechSynthesis.cancel();
        } else {
            audio.pause();
        }
    }

    //重置语音
    function reset() {
        if (audio != null) {
            cancel();
        }
        // else {
        // 	iaudio = new Audio();
        // 	iaudio.src = '';
        // }
    }

    //开始语音导航
    function startVoice(prompt) {
        if (!prompt) return;
        var message = prompt.replace(/\s/g, "");
        message = message.replace(/undefined/g, ''); //去掉undiefined的文字
        if (fmp.globalData.deviceType === 'ios') {
            // var utterThis = new window.SpeechSynthesisUtterance(message);
            // window.speechSynthesis.speak(utterThis);
        } else {
            play(message);
        }
    }

    return {
        startVoice: startVoice,
        stopVoice: cancel,
        pauseVoice: pause,
        resetVoice: reset
    }
});
