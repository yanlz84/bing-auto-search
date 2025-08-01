// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.204
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
var default_search_words = ["中央军委主席习近平签署命令", "海警拖离菲侵权船只 对方掏出枪", "解放军台湾海峡应对挑衅画面曝光", "多预警齐发 这些区域谨慎前往", "14岁女孩摆摊卖玩具25天赚2000元", "上海闹“蝉灾”给山东人急得团团转", "净网：网警打击虚假“警情通报”", "陈芋汐称全红婵不在身边自己责任大", "特朗普签令 将对加拿大关税提至35%", "西方态度分裂 多国将承认巴勒斯坦国", "英伟达回应芯片“后门”问题", "新疆拜城158名徒步者获救 2人遇难", "伊朗探索采用中国北斗系统", "全网最高调的炫富叫“东北独生女”", "俄方宣布控制顿涅茨克重镇", "沙特游乐场“大摆锤”突然断裂", "儿童票“量身高”不如“看年龄”", "牛弹琴：有印度人开始羡慕中国", "美对等关税税率从10%至41%不等", "理想邀请乘龙卡车直播对撞", "《黑太阳731》在港重映满座售罄", "《哪吒2》将于8月2日全网上线", "从诱导到得手仅3步学生被骗近9000元", "东风柳汽：理想撞卡车视频严重侵权", "民办本科真正的挑战是什么", "宁德时代半年盈利305亿", "新东方净利下滑73.7% 俞敏洪怎么办", "“跪行巨人”胡雷携物资驰援密云", "赵心童示意观众为丁俊晖鼓掌", "车主吐槽找加油站走近发现是饭店", "警方回应郑州街头有人拐卖小孩", "苹果第三财季营收大涨", "乘龙员工怼理想：拉低全国人智商", "台风“竹节草”过境 鱼群被冲上马路", "央视曝光票务平台退款难乱象", "“竹节草”继续制造暴雨大暴雨", "大群如蚂蚁一样的东西是加沙饥民", "赵心童6-1丁俊晖晋级大师赛四强", "贵州19岁大学生失联18天", "上海卖菜网红回应摆摊被劝离", "特朗普签署文件宣布恢复校园体测", "回顾国庆70周年阅兵现场", "要求降息未果 特朗普再次吐槽鲍威尔", "朱琳2比0拉门斯晋级16强", "中方驳斥美代表乌问题上对中国指责", "北京怀柔民宿老板讲述洪灾自救经历", "美国又盯上这个中亚邻国", "以色列在外交上“日渐孤立”", "球迷发文感谢孙颖莎", "威尔逊6比3战胜奥沙利文", "墨美将就限制武器毒品贩运达成协议"]

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
