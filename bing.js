// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.252
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
var default_search_words = ["共同擘画上合组织发展新蓝图", "今日三预警齐发！局地最高温超40℃", "林诗栋3-4不敌莫雷加德无缘冠军", "赓续荣光 敢打必胜！", "塞尔维亚将对近3000种商品限价降价", "45岁三甲医院脑梗专家自己脑梗了", "19岁女生留学第9天从39楼坠亡", "莫雷加德夺冠后激动落泪", "鲁迅抽烟墙画被投诉：误导青少年", "“令狐冲”吕颂贤进ICU死里逃生", "证券日报：退市不是“免责金牌”", "西安某公共场所有传染病毒？假", "台风来袭！直击十二级风圈里的三亚", "三孩妈叠加补贴 20多万买110平房子", "成都车展8大豪门集体缺席", "以色列空袭也门首都 已致4死67伤", "80秒回顾九三阅兵3次综合演练画面", "这种“大金镯子”千万别买", "万斯：对俄实施新制裁“并非不可能”", "咬掉穿戴甲救人护士：很痛但应该的", "27岁尿毒症女生：跑一天外卖换一天命", "“我们抢个红包为啥被抓了”", "女子和店员争执后身亡家属索赔218万", "“剑鱼”加强为强台风级", "半只鸡卖1999元 上海一餐厅回应", "三亚海边巨浪直逼灯塔塔顶", "无锡地铁回应宣传图“不雅画面”", "杨幂发文告别《生万物》和绣绣", "三大运营商的“钱袋子”也变瘪了", "多地图书馆成“免费托儿所”", "意法因乌克兰问题发生严重外交摩擦", "于东来：要让员工有精力看电影喝咖啡", "大连高校回应全员停发工资：现已发放", "二手平台出售清华食堂餐具 标价88元", "孙颖莎4-2战胜王曼昱夺冠", "东北说唱歌手：我们说话没有口音啊", "九三阅兵天安门广场布置正式亮相", "机器人烤串把葛珊珊红孩香迷糊了", "年轻人下班送外卖 有人月入3000元", "美批准对乌出售3000余枚ERAM导弹", "九三阅兵最后一次夜间演练画面", "单场打赏千万 团播火热背后一地鸡毛", "快递费上涨 有商家每月多花3万", "3名中国公民在纽约州大巴事故中遇难", "以色列决策层内部发生冲突", "《生万物》被指“农村玛丽苏”", "养殖户养一头猪亏36元", "李在明上任后首次访问美国", "市值124亿公司拟用138亿炒股理财", "公安局副局长赤膊上阵扑倒诈骗分子", "SpaceX取消星舰第十次试飞"]

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
