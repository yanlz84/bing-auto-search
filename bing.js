// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.250
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
var default_search_words = ["为全球治理贡献“上合方案”", "抗战胜利80周年大会第三次演练完成", "全网刷屏的“13元退款”后续来了", "他们是最闪亮的中国名片", "杨宗纬报平安：离精神小伙一步之遥", "泽连斯基：准备采取措施实现和平", "山东通报505名死亡人员被发养老保险", "男子去世存款剩7块5：留满屋赝品古董", "《生万物》反派引反感 扮演者被骂破防", "高价进口水果“跌落凡尘”", "朱立伦宣布“交棒”", "医保新政下退休人员每月返500？假", "牛弹琴：印度狠狠羞辱了特朗普", "格斗女中医：感觉让全中国都失望了", "孙颖莎王曼昱夺得WTT瑞典站女双冠军", "机器人看到大腰子馋得挪不动步", "老人将遗产留“干儿子” 法院：无效", "“何同学”海外走红 年收入或超千万", "官方通报杨宗纬摔下舞台", "王晶谈周星驰仍未婚：与罗慧娟错过", "暴雨台风预警齐发 这些地区注意", "动物园狮子因不爱洗澡走红 酷似乞丐", "何晟铭透露离开电视圈原因", "小伙16岁高考 17岁参加阅兵", "普京访问了消失在地图上的神秘核城", "小学老师被调去教高中：压力很大", "冠军龙鱼做手术修眼 身价值一套房", "陈龙：哪个景区需要演员找我", "停课停工停业！三亚发布台风红色预警", "刘国梁女儿赢得高尔夫职业赛首冠", "丁真自曝曾被嘲身上有异味", "男子娶3个残障老婆？律师解读", "“1小时涨几万” 如此票选校服无意义", "下一个LABUBU来了吗", "林诗栋4比3西蒙高茨", "“鸟门”风潮悄然兴起", "容祖儿演唱会从红馆开到县城校操场", "台湾“大罢免”第二轮投票结束", "王曼昱孙颖莎女单争冠", "丈夫杀妻因抑郁获死缓 搜索记录曝光", "水果越来越甜 是用了“科技狠活”吗", "柬埔寨国王和太后抵京", "国乒男双已连续七站赛事无冠", "韩日领导人发表联合新闻公报", "台湾8·23大罢免投票：无一提案通过", "机器人铁蛋正面刚 锦州烧烤迎战", "小学老师被调去教高中 教育局回应", "印度将暂时停止向美国寄送包裹", "这辆网约车少了一个座", "中国电影《东极岛》在北美正式上映", "亚宠展现“左青龙右白虎”文身犬"]

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
