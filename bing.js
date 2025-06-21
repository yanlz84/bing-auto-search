// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.123
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["弘扬“中国-中亚精神”", "三面包夹 中方驱离菲方船只视频曝光", "苏超彻底暴露了江苏的家底", "中国经济展现强大潜力与向好前景", "唐僧都开始卖房了", "直击苏超焦点战：常州vs南京", "谁在保护哈梅内伊", "张子枫红毯造型又翻车了", "伊朗街头大爷嗑着瓜子看拦截无人机", "吉克隽逸演唱会妆造被吐槽像小龙虾", "霍震霆曝儿子霍启仁已结婚", "公园有人聚众淫乱？成都公安通报", "伊朗突发5.5级地震是核试验吗", "普京：俄准备支持伊朗发展和平核能", "以军称击毙了伊无人机指挥官", "韩国空难致179死 警方已对15人立案", "三十六计 常州用了“侏罗计”", "盐城1-0宿迁 登顶苏超第一", "王力宏演唱会上演真假力宏合唱", "唐国强收时代少年团小卡来认人", "以伊交战下当地华人生活实况", "中国女排今晚迎战日本队", "常州公交上演“最后的倔强”", "网友抢到LABUBU一看店名是泡泡特玛", "伊拉克称被50架以色列战机侵犯领空", "凤凰传奇代言视频疑被下架", "马嘉祺被淘汰嘴角上扬压不住", "阿娇上影节红毯造型显臃肿", "谁抢走了58同城的生意", "伊朗与英法德密谈3小时都谈了什么", "“项羽虞姬”都来苏超助阵了", "#直击南方多地洪灾现状#", "林允粉紫抹胸纱裙好辣", "女子遇洪水被连人带车冲走后失联", "以军高价值导弹击落伊朗廉价无人机", "武林风城市对抗赛上演高手对决", "以色列国防军对伊朗发动新一轮空袭", "47岁倪虹洁性感露背黑裙", "也门数百万人集会声援伊朗巴勒斯坦", "爱尔兰一机构旧址发现800具幼童遗骨", "全国文旅给常州加油", "以色列称伊朗导弹库存不足 伊朗反驳", "伊朗驻华大使：特朗普白日做梦", "普京：担心“滑向第三次世界大战”", "伊朗公布导弹齐射画面", "伊以冲突进入消耗对峙阶段", "《酱园弄》被吐槽像章子怡挨打记", "内地与香港居民可线上实时转账", "华科大获1.8亿元个人匿名捐赠", "美驻中东空军基地军机大量消失", "超2000名公务员被台当局“特查”"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
