// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.406
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
var default_search_words = ["习近平出席第十五届全运会开幕式", "央视曝光：医保卡被薅羊毛", "每天都吃很饱的荒野求生选手退赛", "十五运会这些看点值得关注", "缅甸政府将拆除KK园区148栋建筑", "银行App迎来关停潮", "净网：3人为吸粉引流直播谩骂被拘", "“大鱼海棠”具象化了", "低价“银行直供房”激增", "4.99万元起 京东第一辆车价格定了", "菲律宾超百万人撤离", "新疆一地风机叶片断裂系谣言", "特朗普被严重警告", "路易吉被曝在监狱内非常受欢迎", "网友拍下五台山龙王殿被冰封如仙境", "固体杨枝甘露爆火 有门店芒果卖断货", "胖东来销售额破200亿 控速宣告失败", "美国单日航班取消量超2000次", "《海阔天空》一响 谁的DNA动了", "羊驼送洗后因毛发未吹干致失温死亡", "外卖小哥救火超时赔钱 平台回应", "特朗普宣布一个大消息", "刘德华再唱《中国人》掀全场大合唱", "孙颖莎王楚钦、潘展乐孙杨今日上场", "新研究从药物生产中发现超强抗生素", "起猛了机器人敲上青铜器了", "国际奥委会主席为何来看全运会", "罪犯家属咨询时一句话 民警瞬间警觉", "郑钦文成全运会打卡点", "为嫁高富帅男友与母亲反目 女子道歉", "正直播NBA：活塞vs76人", "年轻人捡漏烂尾车 售后风险不容忽视", "尹锡悦看守所内收逾6.5亿韩元代管金", "周深单依纯唱全运会主题曲", "万斯称美国会赢得未来250年战争", "张朝阳：有些时候我们要拒绝AI", "颜宁团队获2024年北京市科学技术奖", "泰州夺冠后路牌都在炫耀", "吴宜泽夺得2025国锦赛冠军", "因剪辑拼接特朗普视频 BBC高管辞职", "马琳陈若琳郭晶晶等传递火炬", "全运会开幕式烟火太惊艳了", "全运会开幕式暖场响起《朋友》", "俄方：俄军挫败红军城乌军突围", "全运会主火炬点燃好震撼", "全运会最全冷知识来了", "S15决赛T1战胜KT夺冠", "揭秘全运会开幕式四大“名场面”", "不同地点同一姿势 广州人齐看开幕式", "Faker谈多兰多次失误", "为什么“冬吃萝卜夏吃姜”"]

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
