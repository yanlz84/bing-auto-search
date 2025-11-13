// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.413
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
var default_search_words = ["习近平勉励体育健儿奋力拼搏", "如日方武力介入台海中方必将迎头痛击", "贵州的猴子已经进化到上班了", "“十五五”规划《纲要》问计求策", "结婚镜头被换成监控录像 新娘崩溃", "段永平：我就三只股票", "净网：网民散布买卖儿童器官谣言被罚", "泰国国王王后抵京 王毅机场迎接", "18岁小将张展硕3天3金3纪录", "王楚钦4比2林高远晋级4强", "孙颖莎4-0横扫刘斐晋级4强", "多个账号恶意诋毁汽车企业被处置", "佘智江回国受审 下飞机两腿发软", "巴铁疯抢中国硬通货：纳入嫁妆清单", "明年起购置税减半 17家车企承诺兜底", "男子溺亡被摆成睡姿 家属3天后发现", "网友称中奖1200万被骗光 彩票店回应", "少年拿到大学录取通知书不久后病逝", "相亲第2天闪婚 妻子考驾照一去不回", "黄峥嵘被决定逮捕 曾被通报私德不修", "全国羽绒服预警地图来了", "奇瑞就撞坏天门山“天梯”护栏致歉", "九阳股份回应涨停：无哈基米相关产品", "中方敦促美方停止损害中美关系", "前十个月人民币存款增加23.32万亿元", "温度超65℃ 塑料盒会释放有害物质", "哈尔滨推出“红肠公交卡” 造型逼真", "买观赏鱼收到1袋水 商家：烫熟分解了", "中方正告日方在台湾问题上玩火必自焚", "强冷空气来袭！多地降幅达15℃以上", "永庆寺文昌阁火灾系游客用香烛引发", "“熊猫侠”老皮最后一次献血", "神秘培训有人退出反遭围攻羞辱", "百度发布全球最大通用智能体", "今年双11真的“冷”了吗", "全运会散打出现鞭腿KO 选手被踢昏厥", "莫迪就印汽车爆炸案发表强硬声明", "日本自卫队计划恢复“大佐军衔”", "中国自研3D打印发动机完成首次飞行", "军演时飞行器非法闯入 委内瑞拉：击落", "美国务卿：对俄制裁手段已几乎耗尽", "43岁南非女星坠机身亡", "乌合麒麟发布新作《沧海承潮》", "普通摇滚乐队主唱解惠钧意外身亡", "官方通报马库斯和平小屋事件", "浙江确认“高考外语听力播两遍”", "兰州一教育机构老师帮学生洗脚", "奇瑞天门山测试无需文旅部门审批", "奶皮子糖葫芦爆火 三元股份4天4板", "A股收盘：沪指涨0.73%刷新十年新高", "游泳冠军张展硕是复旦大学新闻学的"]

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
