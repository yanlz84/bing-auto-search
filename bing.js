// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.319
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
var default_search_words = ["大美新疆 气象万千", "停课！停运！台风“博罗依”要来了", "国庆“机票价格跳水”别盼了", "第一视角看神二十乘组出舱", "“世界第一高桥”明日正式通车", "公司补班被举报 反手取消14天年假", "净网：网警起底网络水军“生意经”", "夜爬泰山失联的李小龙遗体已找到", "别让“百亿补贴”补出“白色污染”", "小米17破今年国产手机首销纪录", "陪看中网：郑钦文伤愈复出首战", "当地：“女子寻救命恩人”涉嫌炒作", "养殖场回应大量螃蟹爬上马路", "三亚：明日全市停课", "支付宝客服回应解绑健康码行程码", "台湾120头牛被大水冲进太平洋", "8元寿司为何遭年轻人疯抢", "男子被贴强奸犯当街示众算什么习俗", "“无氧”登顶珠峰并返回第一人诞生", "甘肃地震致11人受伤 已有5人出院", "泰国：柬埔寨士兵向泰方开火", "村民不配合灭蚊 扣减30%村集体分红", "餐馆搬走 老板挨个给会员打电话退款", "台风“博罗依”将影响河南", "手机被远程控制转账 一根牙签立功了", "上海明确：这类人每年能请7天带薪假", "迪拜一公司打造10公斤重黄金礼服", "希腊总理警告以色列：再不收手没朋友", "市监局回应延安一餐馆使用阴阳菜单", "郑钦文复出首秀现场响起《奢香夫人》", "马斯克父亲被指控性虐待5名子女", "全球800美军将领被召回 要聊啥", "美拟制造世界最大军用运输机", "云南玉溪连续4任市委书记落马", "美应放弃开发部署全球导弹防御系统", "台风“博罗依”袭击后的菲律宾", "哈马斯同意美国提出的加沙停火方案", "1米3小个子走村串户为老人送餐5年", "千万富翁与母亲相认：要将妈妈带身边", "美国将吊销哥伦比亚总统赴美签证", "“博罗依”在南海“健步如飞”", "以总理胸口戴二维码 要求与会者扫码", "张丹红首度回应与李国庆恋情", "父子兄弟8人齐上阵 偷运锑资源被抓", "法院警车现身山姆：严格执纪、不苛责", "泰柬军方就突发开火各执一词", "赵少康曝卢秀燕不选国民党主席原因", "特朗普对乌用美武器袭俄持开放态度", "美媒称美军将领集结更像动员大会", "韩国请求特朗普帮忙缓和半岛局势", "一学校招50个事业编年薪60万起"]

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
