// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.379
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
var default_search_words = ["把造福人民作为根本价值取向", "局地大雪大暴雪要来了", "中方回应美军两架战机坠入南海", "四中全会公报10次提到“科技”", "渔民抓160斤巨型石斑鱼 多人拖上岸", "119救了110和119", "净网：查处虚构“女技术黑客”案", "专家解析美军机南海坠毁原因", "证监会：加强资本市场中小投资者保护", "31省份去年婚姻数据公布", "广东人生娃积极性第一名", "长白山天池水被“煮开”系谣言", "于谦被恢复执行111万", "宁波市监回应网友理发一次花了6万", "贵州茅台：董事长张德芹辞职", "3个女孩2个月将房子住“包浆”跑路", "特朗普：俄试射核动力巡航导弹不合适", "多地涨工资落地 涨幅在10%以上", "明年或将出最便宜iPhone", "中方回应俄测试可携带核弹头巡航导弹", "马克龙妻子档案性别被改成男性", "蔡磊研发药物对病友起效自己没用", "76岁“欢喜哥”许绍雄被曝病危入院", "金饰克价一夜跌回1211元", "赵一鸣客服回应门店用糖找零", "央行：继续打击境内虚拟货币经营炒作", "坠入南海美军机单价超1亿美元", "油价下调！加满一箱油省10.5元", "蔡磊近况：全身瘫软 语言能力丧失", "国内首次！“一箭36星”分离试验成功", "年轻人也会脑卒中？这些症状要警惕", "春秋航空招已婚已育“空嫂”", "多家央媒就台湾前途命运密集发声", "多所大学开设“带娃专业”", "这6类必须焯水的食物要知道", "神秘绿色球体划过莫斯科上空", "世界唯一！中国在北极连续载人深潜", "中方回应德外长瓦德富尔推迟访华", "王毅对巴勒斯坦代表说永远支持你们", "“馆长”北京爬长城感叹先人智慧", "“馆长”漫步宛平城连呼7个好漂亮", "中方：菲方蓄意挑衅是局势紧张根源", "呼吸道合胞病毒专盯宝宝 已到高发期", "央行将恢复公开市场国债买卖操作", "郑国霖谈景区打工：过气明星缺钱", "非法收受巨额财物 苏斌如被决定逮捕", "新疆吐鲁番市托克逊县发生4.7级地震", "中方回应中美经贸磋商", "珀莱雅双十一背刺消费者？客服回应", "北京建筑大学计算机系创始人去世", "证监会将启动实施深化创业板改革"]

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
