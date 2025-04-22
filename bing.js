// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.2
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
var default_search_words = ["为了老百姓的安居梦", "美股再遇“黑色星期一”", "双汇前任老总游牧突发心梗离世", "关税回旋镖已砸向美企和民众", "湖南发生翻船事件致6人溺亡", "关晓彤录制五四晚会 齐刘海造型超美", "67款APP违法收集使用个人信息被通报", "当事人回应刘强东给自己送外卖", "霍启刚郭晶晶带全家游山西大同", "反诈老陈回应直播4天卖百万：到手8万", "夫妻吵架后妻子挂了医生丈夫的号", "动物行为异常能预测地震？谣言", "教皇方济各去世", "失去美国订单后海外订单量竟然多了", "山东一株番茄苗长成树 年产6000斤", "中方回应美菲军演部署战略战术武器", "地铁被辱骂衣服脏乘客家属发声", "首破3400！金价再创历史新高", "朱珠晒素颜照", "美对从4国进口的太阳能产品加新关税", "雨果夺冠海报：拆长城了", "全红婵陈芋汐这一幕让人心疼又温暖", "江苏一宠物医院被曝粗暴摔打宠物狗", "6.6万亿美债将到期 美国政府要垮？", "京东外卖靠“烧钱”能成功吗", "樊振东陈梦马龙不参加多哈世乒赛", "女子遇电诈找黑客追回损失再被骗", "超1200名经济学家签署反关税宣言", "男子骑共享单车上高速被民警拦下", "瓜帅：与维拉的关键战就是一场决赛", "30批次化妆品不合规 含樊文花和飘柔", "“借基”持有中资产 资金再布局开启", "哈佛大学起诉特朗普政府", "甲亢哥直播复盘中国行", "证券时报：LPR连续6个月“按兵不动”", "雨果夺冠为男乒敲响警钟", "乌称敖德萨遭俄军空袭 3人受伤", "哈萨克斯坦一名副市长遭枪击", "中信建投：MCP加速AI产业发展", "宁德时代推出第二代神行超充电池", "传日本央行拟维持渐进加息立场", "医院回应1男1女在母婴室行不雅之事", "中国反制或让美军无人机计划延期", "2025斯诺克女子世锦赛将于5月开赛", "慕尼黑1860官宣：凯文新赛季回归", "中方回应普京宣布俄军暂时停火", "贝索斯将打造2.5万美元性价比汽车", "女子制售伪劣化妆品被判刑", "避险日元和瑞郎周一至少涨超0.8%", "美稀土“独苗”面临困境", "诋毁俄军将面临最高7年监禁"]

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
