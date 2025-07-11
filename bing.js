// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.162
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
var default_search_words = ["习近平的“川海”之喻", "“大圣同款”泳衣卖爆了", "孙颖莎爆冷出局无缘8强", "今天这几组数据 提气！", "院士预测广东8级地震？官方通报", "特朗普：将对加拿大征收35%关税", "王晶评刘亦菲：观众缘媲美赵雅芝", "高铁E座去哪儿了", "俄新闻主持人直播中向同事求婚", "门店回应38.88万买玛莎拉蒂", "王曼昱不敌朱雨玲 无缘8强", "医保个人账户将全部取消？假", "女子拒绝1人干3人的活被辞 法院判了", "国足出征东亚杯托运140件行李", "民企老板被错关212天 申请千万赔偿", "内蒙古暴雨红警：两地降雨超100毫米", "事关稳定币 上海市国资委开会", "朱雨玲回应战胜王曼昱", "乌克兰一官员在基辅遭近距离枪杀", "落马副局长发视频炒作 单位回应", "姜文电影《你行你上》宣布提档", "演员吴越逛菜市场被偶遇", "美股纳指标普再创新高 特斯拉涨超4%", "上海海关学院录取位次超上海交大", "广汽菲克宣告破产后售后如何保障", "暴雨蓝色预警：广东等14省份大到暴雨", "孙颖莎输球后身影落寞 独自收拾行李", "斯瓦泰克送蛋横扫本西奇晋级决赛", "比特币破117000美元创新高", "杨少华生前剪彩餐馆被恶意打差评", "俄称打击乌军机场 乌称袭击俄军事区", "亚马尔：想教孙颖莎踢足球", "葛荟婕回应女儿小苹果不找她", "巴西总统：将与美国进行关税谈判", "河南鲁山715万建牛郎织女雕塑被吐槽", "电影《超人》中国首映礼", "王艺迪蒯曼晋级女双4强", "日媒炒中国战机“异常接近”日军机", "38岁天津北漂男子下班后住车里近3年", "为涉黑母亲辩护的基层法官被刑拘", "揽佬回应《八方来财》爆红收益过亿", "曝美将向乌提供价值3亿美元军事援助", "山东兑现河南生态补偿金6207万元", "恒大汽车近44万平方米土地被收回", "多角度还原孙颖莎输球时刻", "清华学霸夫妻携手从军", "李乐成会见美国前财政部长保尔森", "即将交手日本队 国足能否制造惊喜", "内蒙古多地突降冰雹 最大如鸡蛋", "美国女将连续四个大满贯进决赛", "对接发文确认胡一天出演《天才女友》"]

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
