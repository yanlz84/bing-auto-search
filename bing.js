// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.117
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
var default_search_words = ["听习主席和中亚好伙伴话合作", "多地“国补”暂停？有关部门回应", "中方回应朝鲜向俄加派6000名工程兵", "第二届中国—中亚峰会成果清单", "伊朗：美国干预将致中东爆发全面战争", "旅行博主江小隐在一景区溺水身亡", "618 购物莫忘安全 网警守护你周全", "以军：多国配合下打击超千个伊朗目标", "那尔那茜从《镖人》主演名单消失", "一文教你“冷”“热”专业怎么选", "伊朗首都东部多地传出巨大爆炸声", "广州高铁站被淹？不实", "连线伊以两地华人 关注前线冲突", "哈梅内伊：伊朗不会投降", "邓紫棋回应蜂鸟音乐称不会下架歌曲", "普京：愿为推动以伊对话提供斡旋协助", "00后女孩醉驾时速174公里撞死3人", "女生吃米线放太多麻油险窒息", "百年一遇洪水 广东怀集6.8万人转移", "曝陈冠希飞机上与机组人员吵架", "乌克兰基辅遭遇袭击 已致23人死亡", "冯绍峰带女友参加聚餐好熟络", "女子腹胀就诊时突然破水产下男婴", "李雪琴曾给老谢写过专栏文章", "蜂鸟音乐要求邓紫棋下架重制版歌曲", "中央巡视期间 “内鬼”杨长俊被查", "老谢称要和李雪琴在法庭掰扯", "#伊媒体称今晚将让世界铭记#", "巴民众车顶绑伊导弹残骸庆祝以遭袭", "莫迪：印巴停火并非因为美国调停", "云南体彩回应1000万彩票被洗衣机洗", "广东出现今年以来最强降水", "美国“参战”可能性正在加大", "八旬老人诊断胃炎被以胃癌切全胃", "以军对伊朗首都展开新一轮袭击", "潘展乐体验攀岩臂展超长", "记者：伊朗导弹袭击减量增次", "伊朗发射超高音速导弹 称控制以领空", "刘强东：京东已不再属于某一个人了", "律师解读李雪琴被举报财务问题", "博士夫妇因孩子太笨去做亲子鉴定", "造谣迪丽热巴鹿晗恋情网友致歉", "爸爸1天3包烟16岁女儿确诊肺癌", "央行宣布八项重磅金融开放举措", "广东绥江怀集段遇建站来最大洪水", "摩萨德分支特工在伊朗被捕现场曝光", "跟着苏超看经济：十三太保底气从何来", "伊朗境内手机已不能上网", "曝伊朗已准备好导弹袭击美军基地", "乌方已接收俄移交的6060具士兵遗体", "大量民众逃离伊朗首都致交通拥堵"]

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
