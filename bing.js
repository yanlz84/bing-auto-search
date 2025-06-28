// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.136
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
var default_search_words = ["习近平会见塞内加尔总理松科", "中国公民海外遇害 8名歹徒被击毙", "特朗普：停止与加拿大所有贸易谈判", "高考志愿新变化：填报志愿注意啥", "蒋欣获奖关晓彤哭了", "特朗普称考虑再次轰炸伊朗", "姚晨发文祝贺丈夫成为奥斯卡评委", "美一飞船失控150人骨灰全扬了", "14岁违法要拘留了？解读", "男子掐死女友藏尸酒店 被执行枪决", "美方将取消对中国一系列限制性措施", "多地机场辟谣相机电池不能上飞机", "《歌手》第七期排名", "被打不敢还手？新法明确正当防卫免罚", "宋佳获白玉兰最佳女主角", "中国记者在俄遭乌袭击：已按恐袭立案", "蒋欣获白玉兰最佳女配角", "蒋奇明获白玉兰奖最佳男配角", "王安宇送蒋欣蛇瓜", "杨瀚森正式亮相开拓者 持16号战袍", "鹿晗脸颊消瘦模样大变", "以色列被曝正密谋在美国搞爆炸", "钟楚曦郑云龙亮相上海电视节红毯", "新修订的《治安管理处罚法》新在何处", "蒋欣热泪盈眶感谢观众", "美国多州报告火球从天而降", "杨紫 看得出她是公主", "宋佳为蒋欣获得最佳女配感到开心", "宋佳获奖后第一束花是闫妮送的", "蒋欣回应“早该拿奖了”", "洪森：他信父女背叛我 背叛泰国", "黎巴嫩南部遭以色列猛烈空袭", "白玉兰颁奖典礼红毯明星造型", "耗资24亿古城开业四年亏了10亿多", "小米YU7的“疯狂星期四”", "广西南宁监狱监狱长主动投案", "黄子韬徐艺洋去看了鹿晗演唱会", "特朗普喊话：拯救“比比”", "刘亦菲缺席白玉兰红毯", "世界顶级数学家张益唐加盟中山大学", "靳东获奖发言老干部风十足", "多方回应湖南母子相继坠河身亡", "#洪灾过后的贵州榕江现状#", "哈工大招生视频称公寓空调全覆盖", "蒋欣关晓彤白玉兰后台热聊", "卢旺达与刚果（金）在美签署和平协议", "九三大阅兵会亮相哪些新型作战力量", "伊朗驻华大使：伊方支持中方四点主张", "杨紫张若昀接受采访", "宋佳实至名归", "地铁要执行充电宝新规吗"]

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
