// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.370
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
var default_search_words = ["一个“实”字解码新时代发展之道", "今冬是否为超级冷冬？气象局释疑", "特朗普：取消与普京的会面", "五年规划为何是中国发展秘诀", "“鸟巢”有多忙？档期已排到2027年", "30年老公厕爆改咖啡店 没营业就被查", "净网：无人机“职业刷机人”涉嫌犯罪", "今日“霜降” 气温由凉转寒", "东北现真人版“鸳鸯锅” 商家回应", "从这些数据读懂中国经济信心和底气", "京东001号车以7819万元拍出", "网民摆拍涉三秋生产视频被通报", "朝鲜称成功进行重要武器系统试验", "秦始皇帝陵又有新发现", "大雨暴雨大雪暴雪 即将上线", "特朗普普京会晤为何被“急踩刹车”", "西安一男子倒垃圾时殴打3名环卫工", "双11原想“买买买” 结果“退退退”", "19岁女生退签MCN被判赔15万元", "现在只剩南极没蚊子了", "正直播NBA：篮网vs黄蜂", "山东河北现串珠型不明发光飞行物", "黄金创12年来最大单日跌幅 金饰热卖", "司机跑500公里送盆栽遭拒收索赔", "美股三大指数集体收跌 奈飞跌超10%", "女子捐200斤旧衣后收到14岁女孩来信", "网友：铁盒清凉油是“最犟种产品”", "车牌7777报废路虎5500元起拍", "男子称养10年儿子非亲生 前妻：污蔑", "长1.4米重70斤 这条草鱼55岁了", "南极旅游价格大跳水 多家旅行社回应", "深圳交通部门回应一骑行道突然断头", "美国一男子疯狂囤500万枚5美分硬币", "台大教授苑举正谈《沉默的荣耀》", "关税致美失去德最大贸易伙伴地位", "法国前总统萨科齐坐牢配“保镖”", "香港连续出现儿童感染甲流严重个案", "峨眉山石碑在瑞士已定居10年", "以色列士兵顺手偷走滑板车被拍下", "170件黄金文物“顶流”免费展出", "美袭击“贩毒船”范围扩大至太平洋", "女子私开消防栓当街洗衣", "00后音乐老师喊麦式课堂走红", "泰国推出多项举措保障中国游客安全", "泰国副财长因被控参与电诈而辞职", "塞尔维亚议会外爆发枪战", "欧冠切尔西5比1阿贾克斯", "黄河即将进入凌汛期 防凌形势严峻", "这些赏红叶的“出片宝地”藏不住了", "“城超”多地开花 如何保持热度", "全球最快高铁坐着是啥感觉"]

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
