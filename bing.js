// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.84
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
var default_search_words = ["总书记要求这些事“从娃娃抓起”", "美国人依赖的“中国制造”TOP10榜单", "追求低级趣味 92年出生的李雪被双开", "一舟载千年的中式浪漫具象化了", "乌战报称摧毁大量俄军机 俄媒：谣言", "关之琳62岁状态", "51岁吴京获赛车冠军", "李亚鹏拟将花费上亿幼儿园无偿移交", "学校换掉下课铃 高三学生哭成泪人", "乌称蛛网行动造成俄方70亿美元损失", "马斯克：不想为美政府所做的一切担责", "吃“聪明药”能提高考试成绩？谣言", "24小时内第2座 俄又一桥梁坍塌", "医生误将患者腹超做成阴超 医院回应", "中国北部有机会出现较为明显的极光", "英首相称将恢复英国“战备状态”", "发明江苏足球联赛的人 一定是个天才", "墨西哥一戒毒中心火灾已致12人死亡", "歼-10超低空飞行含金量超高", "美国男子用燃烧瓶攻击亲以色列团体", "“日本7月5日末日论”疯传", "郑钦文称打5盘都没问题可惜没有", "现场球迷合唱《日不落》送给郑钦文", "郑钦文取胜后直接倒地庆祝", "日本北海道附近海域发生5.9级地震", "樊振东回应加盟德甲联赛", "俄罗斯桥梁坍塌 火车脱轨扭成麻花", "追忆孙中山孙女孙穗瑛", "乌克兰陆军司令已提交辞呈", "未来三天可能发生地磁暴", "郑钦文将第8次对阵萨巴伦卡", "西藏山南罕见红色精灵闪电", "乌方称摧毁41架俄战略轰炸机", "郑钦文社媒：人都应该有梦", "大片领跑端午档票房超3.8亿元", "U16国足夺冠", "云南怒江沿岸有人捡水中浮木当柴烧", "印度网红直播猥亵土耳其导游", "董卿与儿子同台朗读", "女子被疑患精神病邻居多次持刀砍门", "小沈阳演唱会女儿登台唱跳遭吐槽", "南通成苏超榜一大哥", "特朗普又想对中国无人机下黑手", "尼日利亚发生车祸 21名运动员丧生", "樊振东加盟 德国俱乐部：他主动的", "黄子韬徐艺洋在商量婚礼了", "暴雨和强对流双预警齐发", "卡友跨2400公里送缺氧离世司机回家", "龙舟赛冠军队员领奖台同步摔倒", "印军高官称赞印巴两国军人都很理性", "加沙民众领物资路上遇袭 超20人死亡"]

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
