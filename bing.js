// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.245
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
var default_search_words = ["这在党和国家历史上是第一次", "全球首次！中国月度用电量破万亿大关", "中小学生将迎近10年来最长学期", "一张办公桌见证中国战区受降典礼", "9月3日阅兵放假吗", "美国可能对委内瑞拉动武 中方表态", "净网：警惕因支付密码简单而被盗刷", "被两种蛇同时咬伤的大叔血清过敏", "不可饶恕！731部队战后几乎全身而退", "日薪5000元 短剧剧组急缺“霸总爹”", "263斤男子花2万请9名轿夫抬上峨眉山", "网传重庆遭遇百年难遇洪水？不实", "日本多地检出永久性化学物或扩散全国", "出差被性侵认定工伤的女子发声", "8岁男孩随家人旅游时在沙滩上走失", "僵尸松鼠触手兔 美国又发现变异鹿", "白俄罗斯总统卢卡申科宣布将访华", "暴雨、高温五预警齐发！这些地区注意", "中国留学生起诉美大学索赔1亿美元", "泡泡玛特新品定价199 被炒至1999", "高速漏油被罚11万货车司机：车才几万", "常州多家星级酒店宣布暂停摆摊", "湖北一村民称遭老虎袭击 当地通报", "民办大学遇招生难 难在哪", "农村独臂女孩模仿杨过走红：想考编", "4000名日军曾用手榴弹集体自杀", "今年第12号台风“玲玲”生成", "内蒙古鄂尔多斯暴雨已致5人遇难", "面食店夫妻在面条饺子皮里加硼砂", "人民网评高铁站台该不该禁烟", "中国旅客在荷兰吸食毒品行为失控", "外国男子求婚时突遇不远处火山爆发", "“鼠头鸭脖”涉事公司已注销", "外交部：敦促新西兰停止散布谎言", "男子逼问妻子“是否出轨”并施暴", "家长受骗 女儿查看监控发现异常报警", "张朝阳回应“要活到150岁”", "男子酒后开启自动驾驶功能上高速", "福建一村出33名博士", "外交部回应俄方文件揭露731细菌战", "俄乌在哪谈？泽连斯基给出3个选项", "繁殖销售300余条蟒蛇 多人被判刑", "印度男子淋浴时 一老虎试图破窗而入", "儿子称千百惠唯一遗憾未见台湾回归", "高速上对向车道飞来铁件砸伤副驾", "为什么总买不到宣传海报上那份饭", "外交部：敦促日本深刻反省侵略历史", "12306回应能否加挂吸烟车厢", "美国与欧盟就贸易协定框架达成一致", "韩国正在研究周一放假组三天小长假", "老人未去世就被要求火化？当地致歉"]

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
