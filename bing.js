// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.459
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
var default_search_words = ["中法友谊蕴山水", "你以为的进口尖货 其实早已国产了", "劲酒如何成了年轻女性的神仙水", "盘点2025大国重器新突破", "存100万存20万利率一样透露啥信号", "中美合拍《我的哪吒与变形金刚》首播", "美军承认：击落美军战机", "尖叫之夜直播", "美国称将调整与中国经济关系", "周末去哪玩？雪场“不打烊”", "杭州野生动物园黑熊突然袭击饲养员", "12岁男孩被体罚跳楼身亡系谣言", "男子掉入粉碎机身亡 妻子发声", "老干妈不需要创新", "大湾区大学正式成立", "特朗普获得“国际足联和平奖”", "大雪吃三宝是指哪三宝", "“两人挑一担 养活半栋楼”", "张荣恭：敢宣布“台独”大陆立刻动手", "朱孝天被“退出”F4后 妻子回应", "九连胜！混团世界杯国乒8比4胜瑞典", "参军报国！全国征兵网上报名今日开始", "下周降温更猛还有大范围雨雪", "加油站仓库惊现上万套军服 4人获刑", "全网最忙五人组揭开了多少秘密", "《疯狂动物城2》票房突破27亿", "泰兰尼斯童鞋卖600万双营收30亿", "日军南京大屠杀把尸体当桥用", "杭师大通报“公示名单不实”问题", "国乒战胜日本收获8连胜", "吴海龙：日本恐成中俄在亚太最大威胁", "替主人还债的宠物猫降至3600元起拍", "巴基斯坦阿富汗交火 居民连夜撤离", "黑龙江水库冰面现13匹冻死马匹", "中国发射卫星互联网低轨14组卫星", "64岁“乔峰”黄日华称已退出娱乐圈", "日本海参价格暴跌超6成", "专家：日本电磁炮就是“小火柴棍”", "三星堆造型雕塑被掰断？博物馆回应", "为啥今年流感如此厉害", "老君山景区拒用无人机 挑山工发声", "感染流感后有这些症状 建议及时就医", "印尼洪灾和山体滑坡已致908人遇难", "流拍4次的百达翡丽再挂拍 估值4千万", "全网最忙五人组打球赛 还有身份证号", "ChatGPT评21世纪最伟大运动员", "杜兰特生涯总得分破31000分", "陈梦回应是否参加洛杉矶奥运会", "专家：日本正从“防卫”转向“进攻”", "男子疑陷缅北 女友：他称差点被杀", "美一机器人公司欠中国代工厂25亿元"]

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
