// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.85
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
var default_search_words = ["每个孩子都是不可辜负的希望", "中央军委原副主席许其亮逝世", "张家界溶洞垃圾已打捞2.7吨", "端午里的中国活力", "52岁局长涉性侵女子 职务信息被撤", "章子怡晒女儿儿子", "中国女老板再次拒绝美国PUA", "中小学生攀比起“体考神器”碳板鞋", "乌恐遭受俄猛烈报复", "李荣浩疑似被粉丝做局", "医生误将患者腹超做成阴超被停工", "南京“以债换房”可置换月供？假", "俄军地毯式轰炸乌无人机发射场", "“日本7月5日末日论”疯传", "陈梦被曝与王楚钦交往？女方妈妈回应", "男网红直播家暴妻子 本人回应", "山西小伙脖子被扎多根烧烤签", "急救人员回应男子脖子被扎烧烤签", "男子委托网友炒股8个月亏40万", "古天乐称不工作压力更大", "西藏发生山体滑坡已致3死7失联", "俄向乌指挥所投3吨级炸弹：瞬间夷平", "冯小刚女儿高中毕业回国 颜值逆袭", "女子劈开用几年的菜板满是黄曲霉素", "成都90后小伙让刀剑重获新生", "飞行员视角感受歼-10空中近距格斗", "余承东和雷军疑似隔空喊话", "河南七旬老人捡烟花被崩伤", "哈佛演讲的中国女生自曝曾被霸凌", "灭鼠药商跨界造车？金鱼汽车啥来头", "国足出征印尼25人大名单", "桂林暴雨致车库被淹 市民拉绳逃生", "商家称六一表演用鞋被批量退货退款", "福建莆田赛龙舟现场堪比赤壁之战", "国足客战印尼倒计时3天", "幼童掉入高铁股道 工作人员一把拉回", "男子吃野生菌中毒看见水母和凤凰", "中国足协主席宋凯将全程陪伴国足", "哈佛演讲的中国女生否认走后门入学", "俄称击落162架乌军无人机", "《临江仙》定档0606", "乌方称摧毁41架俄战略轰炸机", "俄民众徒手掰断乌军自爆无人机旋翼", "五台山风景区管委会主任王黎明被查", "入户调查已开始 今年抽取30万人", "患者花7万买的抗癌药是临床试验药", "中国女排世界联赛北京站名单出炉", "小沈阳回应女儿被吐槽", "韩国紧急商讨应对美上调钢铝关税", "日本警告：北海道附近可能发生强震", "俄国防部证实俄机场遭袭"]

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
