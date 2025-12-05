// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.457
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
var default_search_words = ["习近平同马克龙在成都非正式会晤", "中方回应解放军是否在南海台海集结", "普京：俄无权干涉中印关系", "我国向天“借”水约1677亿吨", "“全网最忙五人组”曝光", "马克龙访问四川大学 法新社出图了", "净网：有人买卖账号“赚快钱”获刑", "胖东来招聘：50岁以下 年薪100万起", "日本大米价格持续上涨 再次刷新纪录", "这些情况建议戴口罩", "《疯狂动物城2》火了 蛇真的没肩膀吗", "“新疆一县地震致人伤亡”不实", "陈震用空壳工作室偷税 案件细节公布", "苏增添一审被判死缓", "墨西哥世界杯场馆现456袋人体残骸", "处罚名单现“孙俪”等明星 当地通报", "法国总统马克龙访问四川大学", "摩尔线程上市首日大涨谁赢麻了", "国防部：日方若执迷不悟 必犯众怒", "马克龙与川大学生热情打招呼", "1200年前中国人撸的是豹猫", "三大航中日航线免费退改延至明年3月", "流感“排毒期”有多长？专家回应", "马斯克X平台被欧盟罚款1.2亿欧元", "摩尔线程早期投资者暴赚6200倍", "车评人陈震偷税追缴并罚247.48万", "法国总统马克龙结束访华", "南京大屠杀又添新证", "长高1米 “尔滨”网红大雪人回归", "美施压印度停购俄石油 普京怒斥", "国防部证实海军舰艇编队远海训练", "国家铁路局原局长费东斌被“双开”", "“咸猪手”作案时被便衣民警生擒", "文体局回应广东挖出约2米大炮", "安徽“广德三件套”为啥这么火", "日本启动第17次核污染水排海", "琉球民众反对日本部署电子战部队", "印媒发莫迪普京动画片 还恶搞特朗普", "冲绳集会要求高市早苗谢罪", "山东“入室抢婴案”二审择期宣判", "全国流感12月上中旬达峰可能性较大", "男子因质问遛狗不牵绳被打案二审", "中国成功发射交通VDES卫星A星和B星", "美国计划在月面部署两项科学仪器", "港股收盘：百度集团涨逾5%", "哈尔滨冰雪大世界火热建设中", "向“名人账号违法违规”说不", "18年老兵挂满勋章向妻子“报到”", "“鸟中大熊猫”黑鹳飞抵山西阳泉", "信仰为何如此重要", "德国将向波兰部署战机 执行防空任务"]

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
