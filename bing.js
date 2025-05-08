// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.35
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
var default_search_words = ["习近平为何强调这三个关键词", "你的手机信号变成5G-A了吗", "耿爽这段话的含金量还在飙升", "为什么这一纪念不能忘却", "国防部：做美国的朋友可能是致命的", "特大暴雨要来了", "巴总理激动拍桌：我们有实力有核力量", "女孩拿自家金饰去卖老板直接扣下", "医生高铁上救人后反被要求登记信息", "看一揽子金融政策如何稳市场稳预期", "武契奇排除万难抵俄后在红场发声", "福建8岁失联男孩已找到？不实", "巴基斯坦称击落超25架印度无人机", "官方回应有人在银行买到掺假金条", "多国领导人出席红场阅兵", "五一结束但旅行还没停", "韩国为柯洁事件改规则", "办公室轮流请奶茶变“隐形KPI”", "印巴空战内幕：125架战机激战超1小时", "西安碑林博物馆门票从10元涨到85元", "胡杏儿再次为老公发声", "巴总理：本可击落10架以上印战机", "5G-A不只网速快", "大四学生已发14篇SCI论文？校方回应", "福建8岁男童搜寻进入第4天", "巴总理：印度战机被我们打成渣了", "导演夸肖战在《藏海传》里演得非常好", "乌克兰：30年内不打算偿还债务", "香港名媛碎尸案押后6月裁决", "俄士兵跟中国女生学说中文还比心", "印度称摧毁巴第二大城市防空系统", "监控拍到湖南岳阳暴风雨袭来全程", "中国篮协正式启动归化球员流程办理", "俄罗斯外交部发言人用中文回答问题", "米粉店主否认刘畊宏团队强制清场", "男孩放弃二本上大专学烹饪", "墨菲质疑赵心童的参赛资格和排名", "曝窦骁何超莲已分居4个月", "巴方：约50名印度士兵在克什米尔丧生", "患者家属扛樱桃树进医院致谢", "伊朗回应美将波斯湾改称阿拉伯湾", "中央气象台继续发布暴雨黄色预警", "重庆一司机双脚伸出窗外“驾车”", "歌手苟伟遗照是当年选秀照", "大爷收到仿冒取件码后存款消失", "专家解读中美将举行经贸高层会谈", "王星越终于做白鹿的男主了", "刘德华调侃郑则仕“还想生啊”", "白先勇：最伟大的5本小说必有红楼梦", "92号汽油有望重回“6元时代”", "富士回应“撕拉片”被炒至300元一张"]

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
