// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.425
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
var default_search_words = ["推进全面依法治国 总书记最新部署", "解放军警告日本", "日方不撤回错误言论 一切后果自担", "三天六城追赛全运会", "日本旅游遭秒冻 日媒关注百度热搜", "叶国富为什么要重开6000家门店", "中日多个交流活动已叫停", "网红“橙子姐姐”在柬埔寨被逮捕", "模特冠军颜值引争议 组委会回应", "科学家在地下700米捉“鬼”", "若日方一错再错 中方将严厉反制", "大湾区政策红利发放系虚假信息", "中方：日本水产品向中国出口也没市场", "74岁老太杀73岁老太藏尸案择期宣判", "外媒用十年前的图报道中国", "日本水产遭重锤 獐子岛等水产股涨停", "男子晒与“省领导”聊天记录被抓", "赴日机票订单取消量是新预订量27倍", "人口不到16万小国库拉索打进世界杯", "解放军黄海实弹射击", "南海舰队版如果战斗今夜打响", "俞敏洪回应南极游", "朝鲜：日本没资格觊觎常任理事国席位", "日本网友看中方“霸气插兜”心碎了", "李全贪污受贿超2亿被判死缓", "巴基斯坦女童用棒棒糖阻止一场抢劫", "胖东来招聘要求国内仅8所高校符合", "南太行失联43天男子遗体被找到", "连跌四日 东京股市两大股指继续承压", "荷兰宣布暂停对安世半导体行政令", "店家推出真人版“偷甘蔗”活动", "男子买到高铁上“不存在的座位”", "高市别再“搞事”", "俄外交部：高市早苗应汲取历史教训", "韩雪直播卖12.9元棉拖鞋引热议", "C罗马斯克现身白宫 出席特朗普晚宴", "杨瀚森刷新本人NBA生涯纪录", "昆明常务副市长陈伟主动投案", "韩国超大物流中心大火烧了60小时", "郑丽文：“蓝加白”是台湾主流民意", "女儿家门口被害母亲以证人身份出庭", "《上错花轿嫁对郎》作者席绢宣布封笔", "中国航母经典机位如愿上新了", "中方没兴趣搜集英国议会所谓情报", "泰国旅游局欢迎中国游客重返泰国", "国台办：诚邀台胞来场说走就走的旅行", "日防卫大臣：应继续支持无核三原则", "黄国昌赠蓝营水泥钨丝灯", "朱立伦爱将：对“郑黄会”有很多期许", "日本两处住宅发生火灾致3死1失联", "乌称多地遭俄大规模袭击致多人死伤"]

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
